// /backend/src/features/googleCalendar/googleAuthClient.js
import { google } from "googleapis";
import config from "../../config/index.js";

// Function to get OAuth2 client
export const getOAuth2Client = () => {
  if (
    !config.googleCalendarClientId ||
    !config.googleCalendarClientSecret ||
    !config.googleCalendarRedirectUri
  ) {
    throw new Error(
      "Missing Google Calendar configuration. Check your .env file."
    );
  }

  console.log("Using redirect URI:", config.googleCalendarRedirectUri); // Debugging log
  console.log("Using client ID:", config.googleCalendarClientId); // Debugging log

  return new google.auth.OAuth2(
    config.googleCalendarClientId,
    config.googleCalendarClientSecret,
    config.googleCalendarRedirectUri
  );
};

// Helper to get an authorized calendar instance
export const getCalendarInstance = (authClient) => {
  if (!authClient) {
    throw new Error("Auth client is required to create a calendar instance.");
  }

  return google.calendar({ version: "v3", auth: authClient });
};
