// /backend/src/features/auth/auth.controller.js
import asyncHandler from "../../middleware/asyncHandler.js";
import User from "./user.model.js";
import generateToken from "../../utils/generateToken.js";
import { OAuth2Client } from 'google-auth-library';
import config from '../../config/index.js';

// --- Standard Login/Register/Logout (Keep your existing, working functions) ---
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id); // generateToken handles setting the cookie
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // Good to send isAdmin status
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password }); // isAdmin defaults to false in schema

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  // The primary mechanism for logout is clearing the JWT cookie.
  // generateToken sets a new cookie with an immediate expiry.
  // Or you can explicitly clear it.
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Set expiry to a past date
    secure: config.nodeEnv !== "development",
    sameSite: "strict",
  });
  // Optionally, if you implement a server-side token blocklist for immediate invalidation:
  // await invalidateTokenOnServer(req.cookies.jwt); // This is advanced
  res.status(200).json({ message: "Logged out successfully" });
});


// --- Google Sign-In Specific ---
let googleSignInOAuth2Client;
// Initialize client only if config is valid to prevent crashes on startup if misconfigured
if (config.googleWebClientId && config.googleWebClientSecret && config.googleSignInRedirectUri) {
    googleSignInOAuth2Client = new OAuth2Client(
        config.googleWebClientId,
        config.googleWebClientSecret,
        config.googleSignInRedirectUri // This is the default redirect URI for this client instance
    );
} else {
    console.error(
        "CRITICAL: Google Sign-In OAuth2 Client cannot be initialized due to missing configuration " +
        "(GOOGLE_WEB_CLIENT_ID, GOOGLE_WEB_CLIENT_SECRET, or GOOGLE_SIGN_IN_REDIRECT_URI in .env)."
    );
}

// @desc    Initiate Google OAuth flow for User Sign-In
// @route   GET /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    if (!googleSignInOAuth2Client) {
        // This should ideally not be hit if config validation is strict on startup
        throw new Error('Google Sign-In is not configured correctly on the server.');
    }
    const authorizeUrl = googleSignInOAuth2Client.generateAuthUrl({
        access_type: 'offline', // 'offline' to get a refresh token, useful if you need extended access
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile', // Basic profile info (name, picture)
            'https://www.googleapis.com/auth/userinfo.email',   // Email address and verification status
        ],
        prompt: 'consent', // Ensures user sees consent screen, good for getting refresh token
        // redirect_uri here is optional IF it matches the one set during client instantiation.
        // It's good practice to be explicit or rely on the client's default.
        // redirect_uri: config.googleSignInRedirectUri
    });
    res.redirect(authorizeUrl);
});

// @desc    Handle Google OAuth callback for User Sign-In
// @route   GET /api/auth/google/callback
// @access  Public (Google redirects here)
const googleLoginCallback = asyncHandler(async (req, res) => {
    const { code, error: googleError, state } = req.query; // Google might send an 'error' parameter

    if (!googleSignInOAuth2Client) {
        console.error('Google Sign-In callback received, but client is not configured.');
        return res.redirect(`${config.frontendUrl}/login?error=google_server_config_error`);
    }
    if (googleError) {
        console.warn(`Google Sign-In callback error from Google: ${googleError}`);
        return res.redirect(`${config.frontendUrl}/login?error=google_auth_denied_or_failed&message=${encodeURIComponent(googleError)}`);
    }
    if (!code) {
        console.warn('Google Sign-In callback: No authorization code received.');
        return res.redirect(`${config.frontendUrl}/login?error=google_auth_no_code`);
    }

    // Optional: Validate 'state' parameter here if you implemented CSRF protection by sending a state
    // if (!state || state !== req.session.oauthState) { /* handle error */ } delete req.session.oauthState;

    try {
        // Exchange the authorization code for tokens
        const { tokens } = await googleSignInOAuth2Client.getToken(code);
        // googleSignInOAuth2Client.setCredentials(tokens); // Not strictly needed here if only verifying ID token once

        // Verify the ID token (this contains user information)
        const ticket = await googleSignInOAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: config.googleWebClientId, // MUST be your app's Google Web Client ID
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            console.error('Google Sign-In Error: Email not found in ID token payload.', payload);
            return res.redirect(`${config.frontendUrl}/login?error=google_auth_email_missing`);
        }
        if (!payload.email_verified) {
            console.warn('Google Sign-In Warning: Email not verified by Google.', payload.email);
            // Decide if you want to allow unverified emails or show an error/warning
            // return res.redirect(`${config.frontendUrl}/login?error=google_email_not_verified`);
        }

        let user = await User.findOne({ email: payload.email });

        if (user) { // User exists
            if (!user.googleId) { // If existing user logs in via Google for first time
                user.googleId = payload.sub; // 'sub' is Google's unique ID for the user
            }
            // Optionally update name if it changed or was generic
            if (user.name !== payload.name && payload.name) {
                user.name = payload.name;
            }
            await user.save();
        } else { // New user, create an account
            // For password: if your schema 'requires' it, you must provide one.
            // For social logins, it's common to make password optional or generate a long random unguessable one.
            const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36).slice(2); // Secure enough for non-use
            user = await User.create({
                name: payload.name || payload.given_name || payload.email.split('@')[0], // Best available name
                email: payload.email,
                password: randomPassword, // Satisfy schema if password is required
                googleId: payload.sub,
                isAdmin: false, // Default for new sign-ups
                isGoogleCalendarAuthorized: false, // Default
                hasInteractedWithChatbot: false,  // Default
            });
        }

        generateToken(res, user._id); // This generates your app's JWT and sets the cookie
        // Redirect to a specific frontend route that will then trigger AuthContext update and navigate to dashboard
        res.redirect(`${config.frontendUrl}/auth/google/success`);

    } catch (error) {
        console.error('Google OAuth Callback Processing Error:', error.message);
        // Log detailed error if it's from Google's API
        if (error.response && error.response.data) {
            console.error('Google API Error during token exchange/verification:', error.response.data);
        }
        res.redirect(`${config.frontendUrl}/login?error=google_auth_processing_failed&message=${encodeURIComponent(error.message)}`);
    }
});

export { loginUser, registerUser, logoutUser, googleLogin, googleLoginCallback };