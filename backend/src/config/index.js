// backend/src/config/index.js
import dotenv from 'dotenv';

// Load .env file (if it exists) into process.env
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5123,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  // Add any other environment variables you need
  // Example: Frontend URL for CORS in production
  // frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
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

export default config;