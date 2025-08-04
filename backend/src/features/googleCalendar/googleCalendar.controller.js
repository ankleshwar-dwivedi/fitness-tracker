// /backend/src/features/googleCalendar/googleCalendar.controller.js
import asyncHandler from "../../middleware/asyncHandler.js";
import User from "../auth/user.model.js";
import { getOAuth2Client, getCalendarInstance } from "./googleAuthClient.js";
import config from "../../config/index.js";

const APP_TAG = config.appIdentifierTag; // e.g., "FitTrackAppEvent"

// @desc    Generate Google Calendar authorization URL
// @route   GET /api/google-calendar/authorize
// @access  Private
const authorizeGoogleCalendar = asyncHandler(async (req, res) => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    "https://www.googleapis.com/auth/calendar", // Full access
    // 'https://www.googleapis.com/auth/calendar.events' // Events only, if preferred
  ];

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Crucial for refresh token
    scope: scopes,
    prompt: "consent", // Force consent screen to ensure refresh token is issued
    state: req.user._id.toString(), // Optional: pass user ID for linking back, ensure security
  });

  res.redirect(authorizationUrl);
});

// @desc    Handle Google Calendar OAuth2 callback
// @route   GET /api/google-calendar/oauth2callback
// @access  Public (but processes based on state if used)
const googleCalendarOAuth2Callback = asyncHandler(async (req, res) => {
  const { code, state } = req.query; // 'state' can be used to verify the user if you passed it

  if (!code) {
    // Redirect to a frontend error page or send an error response
    return res
      .status(400)
      .redirect("/profile?google-auth=error&message=MissingAuthorizationCode");
  }

  const oauth2Client = getOAuth2Client();
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Find user. If you used 'state' to pass userId, you can find user by state.
    // For simplicity, assuming the user who initiated this is the one to link.
    // In a robust system, you'd link this more securely, perhaps via session or JWT if 'state' is complex.
    // For this example, we'll assume the 'state' IS the userId (as passed in authorizeGoogleCalendar)
    // THIS IS A SIMPLIFICATION. Ensure `state` is validated properly to prevent CSRF.
    const userId = state; // This assumes state was user._id
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(400)
        .redirect("/profile?google-auth=error&message=UserNotFoundForState");
    }

    user.googleAccessToken = tokens.access_token;
    if (tokens.refresh_token) {
      // Refresh token is not always sent on subsequent authorizations
      user.googleRefreshToken = tokens.refresh_token;
    }
    user.googleTokenExpiryDate = new Date(tokens.expiry_date);
    user.isGoogleCalendarAuthorized = true;
    await user.save();

    // Redirect to a frontend success page
    res.redirect(`http://localhost:5173/meal-plan?google-auth=success`);
  } catch (error) {
    console.error("Error exchanging token or saving to user:", error);
    res
      .status(500)
      .redirect("/profile?google-auth=error&message=TokenExchangeFailed");
  }
});

// Helper function to get an authorized client for a user
const getUserAuthedClient = async (userId) => {
  const user = await User.findById(userId).select(
    "+googleAccessToken +googleRefreshToken +googleTokenExpiryDate"
  );
  if (!user || !user.isGoogleCalendarAuthorized || !user.googleAccessToken) {
    const err = new Error(
      "User not authorized with Google Calendar or tokens missing."
    );
    err.statusCode = 403; // Forbidden
    throw err;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiryDate
      ? user.googleTokenExpiryDate.getTime()
      : null,
  });

  // Handle token refresh if necessary (googleapis library often does this automatically if refresh token is present)
  // You can force a refresh check:
  if (oauth2Client.isTokenExpiring()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      user.googleAccessToken = credentials.access_token;
      if (credentials.expiry_date) {
        user.googleTokenExpiryDate = new Date(credentials.expiry_date);
      }
      await user.save();
    } catch (refreshError) {
      console.error("Failed to refresh Google token:", refreshError);
      user.isGoogleCalendarAuthorized = false; // Mark as de-authorized
      await user.save();
      const err = new Error(
        "Failed to refresh Google token. Please re-authorize."
      );
      err.statusCode = 401; // Unauthorized
      throw err;
    }
  }
  return oauth2Client;
};

// @desc    List events from Google Calendar created by this app
// @route   GET /api/google-calendar/events
// @access  Private
const listAppEvents = asyncHandler(async (req, res) => {
  const oauth2Client = await getUserAuthedClient(req.user._id);
  const calendar = getCalendarInstance(oauth2Client);

  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(), // Example: from now onwards
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
      q: APP_TAG, // Filter by our app's identifier tag in description/summary
    });

    const events = response.data.items.filter(
      (event) =>
        (event.description && event.description.includes(APP_TAG)) ||
        (event.summary && event.summary.includes(APP_TAG)) // Also check summary
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Failed to fetch calendar events." });
  }
});

// @desc    Create an event on Google Calendar
// @route   POST /api/google-calendar/events
// @access  Private
const createAppEvent = asyncHandler(async (req, res) => {
  const {
    summary,
    description,
    startTime,
    endTime,
    location,
    attendees,
    notificationMinutes,
  } = req.body; // attendees as array of emails

  if (!summary || !startTime || !endTime) {
    res.status(400);
    throw new Error(
      "Summary, startTime, and endTime are required for creating an event."
    );
  }

  const oauth2Client = await getUserAuthedClient(req.user._id);
  const calendar = getCalendarInstance(oauth2Client);

  const event = {
    summary: `${summary} [${APP_TAG}]`, // Add tag to summary
    location: location || "",
    description: `${description || ""}\n\nEvent managed by ${APP_TAG}.`, // Add tag to description
    start: {
      dateTime: startTime, // e.g., '2024-06-15T09:00:00-07:00'
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // User's local timezone
    },
    end: {
      dateTime: endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: attendees ? attendees.map((email) => ({ email })) : [],
    reminders: {
      useDefault: false,
      overrides: notificationMinutes
        ? [
            { method: "popup", minutes: parseInt(notificationMinutes, 10) },
            { method: "email", minutes: parseInt(notificationMinutes, 10) }, // Optional: email reminder
          ]
        : [
            // Default reminder if not specified
            { method: "popup", minutes: 30 },
          ],
    },
    // Extended properties for more robust filtering if needed
    // extendedProperties: {
    //   private: {
    //     appSource: APP_TAG
    //   }
    // }
  };

  try {
    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    res.status(201).json(createdEvent.data);
  } catch (error) {
    console.error(
      "Error creating calendar event:",
      error.response ? error.response.data : error
    );
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Failed to create calendar event." });
  }
});

// @desc    Update an event on Google Calendar created by this app
// @route   PUT /api/google-calendar/events/:eventId
// @access  Private
const updateAppEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const {
    summary,
    description,
    startTime,
    endTime,
    location,
    attendees,
    notificationMinutes,
  } = req.body;

  const oauth2Client = await getUserAuthedClient(req.user._id);
  const calendar = getCalendarInstance(oauth2Client);

  try {
    // First, fetch the event to ensure it belongs to the app (optional, but good practice)
    const existingEvent = await calendar.events.get({
      calendarId: "primary",
      eventId,
    });
    if (
      !existingEvent.data.description ||
      !existingEvent.data.description.includes(APP_TAG)
    ) {
      if (
        !existingEvent.data.summary ||
        !existingEvent.data.summary.includes(APP_TAG)
      ) {
        res.status(403);
        throw new Error(
          "Event not managed by this application or tag missing."
        );
      }
    }

    const eventDetails = {
      summary: summary ? `${summary} [${APP_TAG}]` : existingEvent.data.summary,
      location: location !== undefined ? location : existingEvent.data.location,
      description:
        description !== undefined
          ? `${description}\n\nEvent managed by ${APP_TAG}.`
          : existingEvent.data.description,
      start: startTime
        ? {
            dateTime: startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        : existingEvent.data.start,
      end: endTime
        ? {
            dateTime: endTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        : existingEvent.data.end,
      attendees: attendees
        ? attendees.map((email) => ({ email }))
        : existingEvent.data.attendees,
    };

    if (notificationMinutes !== undefined) {
      eventDetails.reminders = {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: parseInt(notificationMinutes, 10) },
          { method: "email", minutes: parseInt(notificationMinutes, 10) },
        ],
      };
    } else if (existingEvent.data.reminders) {
      eventDetails.reminders = existingEvent.data.reminders;
    }

    const updatedEvent = await calendar.events.update({
      calendarId: "primary",
      eventId,
      resource: eventDetails,
    });
    res.json(updatedEvent.data);
  } catch (error) {
    console.error(
      "Error updating calendar event:",
      error.response ? error.response.data : error
    );
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Failed to update calendar event." });
  }
});

// @desc    Get Google Calendar authorization status for the user
// @route   GET /api/google-calendar/status
// @access  Private
const getGoogleCalendarAuthStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({
    isGoogleCalendarAuthorized: user.isGoogleCalendarAuthorized || false,
  });
});

export {
  authorizeGoogleCalendar,
  googleCalendarOAuth2Callback,
  listAppEvents,
  createAppEvent,
  updateAppEvent,
  getGoogleCalendarAuthStatus,
};
