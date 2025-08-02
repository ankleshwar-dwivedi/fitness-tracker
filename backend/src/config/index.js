// backend/src/config/index.js
import dotenv from "dotenv";
dotenv.config(); // Load .env file contents into process.env

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 5123,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  //external apis
  calorieNinjasApiKey: process.env.CALORIE_NINJAS_API_KEY,
  apiNinjasApiKey: process.env.API_NINJAS_API_KEY,

  // Google Sign-In OAuth Credentials (for user authentication)
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  googleWebClientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET,
  googleSignInRedirectUri: process.env.GOOGLE_SIGN_IN_REDIRECT_URI,

  // Google Calendar API OAuth Credentials (for accessing calendar data)
  googleCalendarClientId: process.env.GOOGLE_CALENDAR_CLIENT_ID, // Can be same as WebClientId if types match
  googleCalendarClientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET, // Can be same
  googleCalendarRedirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI,

  appIdentifierTag: process.env.APP_IDENTIFIER_TAG || "FitTrackAppEvent",
  // geminiApiKey: process.env.GEMINI_API_KEY,
  // chatInteractionLimit: parseInt(process.env.CHAT_INTERACTION_LIMIT, 10) || 50,
};

// --- Essential Configuration Validations ---
if (!config.mongoURI) {
  console.error(
    "FATAL ERROR: MONGO_URI is not defined in .env. Application cannot start."
  );
  process.exit(1);
}
if (!config.jwtSecret || config.jwtSecret.length < 32) {
  console.error(
    "FATAL ERROR: JWT_SECRET is not defined or is too short (min 32 chars) in .env. Application cannot start."
  );
  process.exit(1);
}
if (!config.frontendUrl) {
  console.warn(
    "WARNING: FRONTEND_URL is not defined in .env. Defaulting to http://localhost:5173. This is important for redirects."
  );
}

// Validate Google Sign-In configurations (make these fatal if this feature is critical)
if (config.nodeEnv !== "test") {
  if (!config.googleWebClientId) {
    console.error(
      "FATAL ERROR: GOOGLE_WEB_CLIENT_ID for Sign-In is not defined in .env."
    );
    process.exit(1);
  }
  if (!config.googleWebClientSecret) {
    // Secret is needed for server-side code exchange
    console.error(
      "FATAL ERROR: GOOGLE_WEB_CLIENT_SECRET for Sign-In is not defined in .env."
    );
    process.exit(1);
  }
  if (!config.googleSignInRedirectUri) {
    console.error(
      "FATAL ERROR: GOOGLE_SIGN_IN_REDIRECT_URI is not defined in .env."
    );
    process.exit(1);
  }

  // Warnings for Calendar config (can be errors if calendar is immediately critical)
  if (
    !config.googleCalendarClientId ||
    !config.googleCalendarClientSecret ||
    !config.googleCalendarRedirectUri
  ) {
    console.warn(
      "WARNING: Google Calendar API credentials (Client ID, Secret, or Redirect URI) are not fully defined. Calendar integration may not work."
    );
  }
}

//external apis validations
if (!config.calorieNinjasApiKey) {
  console.warn(
    "WARNING: CALORIE_NINJAS_API_KEY is not defined. Meal calorie lookup will not work."
  );
}
if (!config.apiNinjasApiKey) {
  console.warn(
    "WARNING: API_NINJAS_API_KEY is not defined. Workout calorie burn lookup will not work."
  );
}

export default config;
