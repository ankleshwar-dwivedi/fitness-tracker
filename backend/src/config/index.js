// backend/src/config/index.js
import dotenv from 'dotenv';

// Load .env file (if it exists) into process.env
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5123,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  // Add Google Calendar API credentials
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  appIdentifierTag: process.env.APP_IDENTIFIER_TAG || 'MyAppEventTag', // For identifying app-created events
};

// Validate essential configurations
if (!config.mongoURI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}
if (!config.jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}
// Validate Google API Config (optional but good practice)
if (config.nodeEnv !== 'test') { // Don't require for tests if not used
    if (!config.googleClientId || !config.googleClientSecret || !config.googleRedirectUri) {
        console.warn("WARNING: Google Calendar API credentials are not fully defined. Calendar integration may not work.");
        // You might choose to make these fatal errors if Calendar is a core feature:
        // console.error("FATAL ERROR: Google Calendar API credentials are not defined.");
        // process.exit(1);
    }
}


export default config;