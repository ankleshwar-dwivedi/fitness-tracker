// src/components/Profile/GoogleCalendarSettings.jsx
import React from 'react';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

const GoogleCalendarSettings = ({
  isGoogleCalendarAuthed,
  googleCalLoading,
  googleAuthUrl,
  // googleCalMessage // Message is handled by ProfilePage for global banner
}) => {
  return (
    <div className="bg-cyan-200 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl  text-indigo-500 font-semibold mb-4">Integrations</h2>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Google Calendar</h3>
          <p className="text-sm text-gray-600">
            {isGoogleCalendarAuthed
              ? "Connected to Google Calendar."
              : "Connect your Google Calendar to sync meal plans and reminders."}
          </p>
        </div>
        {googleCalLoading ? (
          <LoadingSpinner size="w-6 h-6" />
        ) : isGoogleCalendarAuthed ? (
          <Button variant="danger" onClick={() => { alert("Disconnect functionality to be added."); }}>
            Disconnect
          </Button>
        ) : (
          <a href={googleAuthUrl}>
            <Button variant="primary">
              Connect Google Calendar
            </Button>
          </a>
        )}
      </div>
      {/* Future: UI to list/manage fetched calendar events could go here or a new component */}
    </div>
  );
};

export default GoogleCalendarSettings;