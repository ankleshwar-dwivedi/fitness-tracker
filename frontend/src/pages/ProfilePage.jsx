// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfile, updateProfile, getStatus, updateStatus,
  getGoogleCalendarAuthStatus // Import the new API function
} from '../lib/apiClient';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ProfilePage = () => {
  const { user, checkAuthStatus } = useAuth();

  // Profile State (existing)
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Status State (existing)
  const [statusData, setStatusData] = useState({
    height: '', weight: '', goalWeight: '', age: '', gender: '', activityLevel: '', goal: ''
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  // Google Calendar State
  const [isGoogleCalendarAuthed, setIsGoogleCalendarAuthed] = useState(false);
  const [googleCalLoading, setGoogleCalLoading] = useState(true);
  const [googleCalMessage, setGoogleCalMessage] = useState(''); // For success/error from redirect


  // Construct the backend authorization URL
  // In a production environment, you might get this base URL from an environment variable
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5123'; // Vite specific or fallback
  const googleAuthUrl = `${backendBaseUrl}/api/google-calendar/authorize`;


  const fetchGoogleCalStatus = useCallback(async () => {
    setGoogleCalLoading(true);
    try {
      const res = await getGoogleCalendarAuthStatus();
      setIsGoogleCalendarAuthed(res.data.isGoogleCalendarAuthorized);
    } catch (err) {
      console.error("Failed to fetch Google Calendar status:", err);
      // Potentially set an error message
    } finally {
      setGoogleCalLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for Google Auth redirect query params
    const queryParams = new URLSearchParams(window.location.search);
    const googleAuthParam = queryParams.get('google-auth');
    const messageParam = queryParams.get('message');

    if (googleAuthParam === 'success') {
      setGoogleCalMessage('Successfully connected to Google Calendar!');
      fetchGoogleCalStatus(); // Re-fetch status
      // Clean URL
      window.history.replaceState({}, document.title, "/profile");
    } else if (googleAuthParam === 'error') {
      setGoogleCalMessage(`Google Calendar connection failed: ${messageParam || 'Unknown error'}`);
       // Clean URL
      window.history.replaceState({}, document.title, "/profile");
    }

    if (user) {
      fetchGoogleCalStatus();
    }
  }, [user, fetchGoogleCalStatus]);


  // Fetch initial data (Profile & Status - existing)
  useEffect(() => {
    const fetchUserData = async () => {
      // ... (existing profile and status fetching logic) ...
      setProfileLoading(true);
      setStatusLoading(true);
      try {
        const profileRes = await getProfile();
        setProfileData({ name: profileRes.data.name, email: profileRes.data.email });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfileError("Failed to load profile data.");
      } finally {
        setProfileLoading(false);
      }

      try {
        const statusRes = await getStatus();
        setStatusData(statusRes.data || {
             height: '', weight: '', goalWeight: '', age: '', gender: '', activityLevel: '', goal: ''
        });
      } catch (err) {
         if (err.response && err.response.status === 404) {
             console.log("No status found, user can create one.");
         } else {
            console.error("Failed to fetch status:", err);
            setStatusError("Failed to load status data.");
         }
      } finally {
        setStatusLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // ... (existing handlers: handleProfileChange, handleStatusChange, handleProfileUpdate, handlePasswordUpdate, handleStatusUpdate)

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    const payload = { name: profileData.name };
    // If email change is allowed, add it here: payload.email = profileData.email;

    try {
      const response = await updateProfile(payload);
      setProfileData({ name: response.data.name, email: response.data.email });
      await checkAuthStatus();
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

 const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setProfileError('New passwords do not match.');
      return;
    }
    if (newPassword.length > 0 && newPassword.length < 6) {
        setProfileError('Password must be at least 6 characters long.');
        return;
    }
    if (!newPassword) { // Only proceed if a new password is provided
        setProfileError('Please enter a new password if you wish to update it.');
        return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    const payload = { password: newPassword };

    try {
      await updateProfile(payload); // Assuming your updateProfile handles password
      setProfileSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusLoading(true);
    setStatusError('');
    setStatusSuccess('');
    const payload = {
        ...statusData,
        height: statusData.height ? Number(statusData.height) : null,
        weight: statusData.weight ? Number(statusData.weight) : null,
        goalWeight: statusData.goalWeight ? Number(statusData.goalWeight) : null,
        age: statusData.age ? Number(statusData.age) : null,
    };
    Object.keys(payload).forEach(key => (payload[key] === null || payload[key] === '') && delete payload[key]);

    try {
      const response = await updateStatus(payload);
      setStatusData(response.data);
      setStatusSuccess('Status updated successfully!');
       setTimeout(() => setStatusSuccess(''), 3000);
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };


  if (!user) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>

      {/* Google Calendar Message Banner */}
      {googleCalMessage && (
        <div className={`p-3 rounded mb-4 text-sm ${googleCalMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {googleCalMessage}
        </div>
      )}

      {/* Profile Section (existing form) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
        {profileError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{profileError}</p>}
        {profileSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{profileSuccess}</p>}
        <form onSubmit={handleProfileUpdate} className="space-y-4 mb-6 pb-6 border-b">
           <Input id="name" name="name" label="Full Name" type="text" value={profileData.name} onChange={handleProfileChange} required />
           <Input id="email" name="email" label="Email Address" type="email" value={profileData.email} readOnly className="bg-gray-100 cursor-not-allowed" />
           <Button type="submit" isLoading={profileLoading && !newPassword} disabled={profileLoading}>Update Name</Button>
        </form>
        <h3 className="text-xl font-semibold mb-4">Update Password</h3>
         <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <Input id="newPassword" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
          <Input id="confirmNewPassword" label="Confirm New Password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
           <Button type="submit" isLoading={profileLoading && !!newPassword} disabled={profileLoading || (!newPassword && !confirmNewPassword) }>Update Password</Button>
        </form>
      </div>


      {/* Google Calendar Integration Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Integrations</h2>
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
            <Button variant="danger" onClick={() => {/* Implement disconnect logic */ alert("Disconnect functionality to be added.")}}>
              Disconnect
            </Button>
          ) : (
            <a href={googleAuthUrl}> {/* Direct link to backend auth endpoint */}
              <Button variant="primary">
                Connect Google Calendar
              </Button>
            </a>
          )}
        </div>
        {/* You can add UI here to list/manage fetched calendar events later */}
      </div>


      {/* Status Section (existing form) */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Fitness Status</h2>
         {statusError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{statusError}</p>}
         {statusSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{statusSuccess}</p>}
        <form onSubmit={handleStatusUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="height" name="height" label="Height (cm)" type="number" value={statusData.height || ''} onChange={handleStatusChange} placeholder="e.g., 175" />
          <Input id="weight" name="weight" label="Current Weight (kg)" type="number" step="0.1" value={statusData.weight || ''} onChange={handleStatusChange} placeholder="e.g., 70.5" />
          <Input id="goalWeight" name="goalWeight" label="Goal Weight (kg)" type="number" step="0.1" value={statusData.goalWeight || ''} onChange={handleStatusChange} placeholder="e.g., 68" />
          <Input id="age" name="age" label="Age" type="number" value={statusData.age || ''} onChange={handleStatusChange} placeholder="e.g., 30" />
          <div className="mb-4">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select id="gender" name="gender" value={statusData.gender || ''} onChange={handleStatusChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
           <div className="mb-4">
            <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select id="activityLevel" name="activityLevel" value={statusData.activityLevel || ''} onChange={handleStatusChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">Select Activity Level</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightlyActive">Lightly Active</option>
              <option value="active">Active</option>
              <option value="veryActive">Very Active</option>
            </select>
          </div>
           <div className="mb-4 md:col-span-2">
             <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
             <select id="goal" name="goal" value={statusData.goal || ''} onChange={handleStatusChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">Select Goal</option>
              <option value="Cutting">Weight Loss (Cutting)</option>
              <option value="Maintenance">Weight Maintenance</option>
              <option value="Bulking">Weight Gain (Bulking)</option>
            </select>
          </div>
          <div className="md:col-span-2">
             <Button type="submit" variant="primary" className="w-full md:w-auto" isLoading={statusLoading} disabled={statusLoading}>Update Status</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;