import React, { useState } from 'react';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';

const GoogleCalendarSettings = ({
  isGoogleCalendarAuthed: initialGoogleCalendarAuthed,
  googleCalLoading,
  googleAuthUrl,
}) => {
  const [isAuthed, setIsAuthed] = useState(initialGoogleCalendarAuthed);

  const handleDisconnect = () => {
   
    setIsAuthed(false); 
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">Integrations</h2>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Google Calendar</h3>
          <p className="text-sm text-gray-600">
            {isAuthed
              ? "Connected to Google Calendar."
              : "Connect your Google Calendar to sync meal plans and reminders."}
          </p>
        </div>
        {googleCalLoading ? (
          <LoadingSpinner size="w-6 h-6" />
        ) : isAuthed ? (
          <Button variant="danger" onClick={handleDisconnect}>
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
    </div>
  );
};

export default GoogleCalendarSettings;