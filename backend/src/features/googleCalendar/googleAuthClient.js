// /backend/src/features/googleCalendar/googleAuthClient.js
import { google } from 'googleapis';
import config from '../../config/index.js';

export const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
};

// Helper to get an authorized calendar instance
export const getCalendarInstance = (authClient) => {
    return google.calendar({ version: 'v3', auth: authClient });
};