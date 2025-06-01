// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfile, updateProfile, getStatus, updateStatus,
  getGoogleCalendarAuthStatus
} from '../lib/apiClient';
import LoadingSpinner from '../components/Common/LoadingSpinner';

// Import new sub-components
import AccountDetailsForm from '../components/Profile/AccountDetailsForm';
import PasswordUpdateForm from '../components/Profile/PasswordUpdateForm';
import GoogleCalendarSettings from '../components/Profile/GoogleCalendarSettings';
import FitnessStatusForm from '../components/Profile/FitnessStatusForm';

const ProfilePage = () => {
  const { user, checkAuthStatus } = useAuth();

  // --- State Management ---
  // Profile State
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fitness Status State
  const [statusData, setStatusData] = useState({
    height: '', weight: '', goalWeight: '', age: '', gender: '', activityLevel: '', goal: ''
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  // Google Calendar State
  const [isGoogleCalendarAuthed, setIsGoogleCalendarAuthed] = useState(false);
  const [googleCalLoading, setGoogleCalLoading] = useState(true);
  const [googleCalMessage, setGoogleCalMessage] = useState('');


  // --- Derived Values ---
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5123';
  const googleAuthUrl = `${backendBaseUrl}/api/google-calendar/authorize`;


  // --- Callbacks and Effects ---
  const fetchGoogleCalStatus = useCallback(async () => {
    if (!user) return;
    setGoogleCalLoading(true);
    try {
      const res = await getGoogleCalendarAuthStatus();
      setIsGoogleCalendarAuthed(res.data.isGoogleCalendarAuthorized);
    } catch (err) {
      console.error("Failed to fetch Google Calendar status:", err);
      setGoogleCalMessage("Could not fetch Google Calendar status.");
    } finally {
      setGoogleCalLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const googleAuthParam = queryParams.get('google-auth');
    const messageParam = queryParams.get('message');

    if (googleAuthParam === 'success') {
      setGoogleCalMessage('Successfully connected to Google Calendar!');
      fetchGoogleCalStatus();
      window.history.replaceState({}, document.title, "/profile");
    } else if (googleAuthParam === 'error') {
      setGoogleCalMessage(`Google Calendar connection failed: ${messageParam || 'Unknown error'}`);
      window.history.replaceState({}, document.title, "/profile");
    }
  }, [fetchGoogleCalStatus]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;

      setProfileLoading(true);
      try {
        const profileRes = await getProfile();
        setProfileData({ name: profileRes.data.name, email: profileRes.data.email });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfileError("Failed to load profile data.");
      } finally {
        setProfileLoading(false);
      }

      setStatusLoading(true);
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

      fetchGoogleCalStatus();
    };
    fetchInitialData();
  }, [user, fetchGoogleCalStatus]);


  // --- Event Handlers for Form Inputs ---
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (e) => {
    setStatusData({ ...statusData, [e.target.name]: e.target.value });
  };

  // --- Form Submission Handlers ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    setPasswordError(''); // Clear password error if name update is tried
    setPasswordSuccess('');

    const payload = { name: profileData.name };
    try {
      const response = await updateProfile(payload);
      setProfileData({ name: response.data.name, email: response.data.email });
      await checkAuthStatus(); // Update user context (e.g., for Navbar name)
      setProfileSuccess('Name updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length > 0 && newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password if you wish to update it.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    setProfileError(''); // Clear profile error if password update is tried
    setProfileSuccess('');

    const payload = { password: newPassword };
    try {
      await updateProfile(payload); // Assumes backend handles password update on the same endpoint
      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
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
      setStatusSuccess('Fitness status updated successfully!');
      setTimeout(() => setStatusSuccess(''), 3000);
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update fitness status.');
    } finally {
      setStatusLoading(false);
    }
  };

  // --- Render Logic ---
  if (!user || (profileLoading && !profileData.name)) { // Initial loading state
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>

      {googleCalMessage && (
        <div className={`p-3 rounded mb-4 text-sm ${googleCalMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {googleCalMessage}
        </div>
      )}

      {/* Account Details and Password Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <AccountDetailsForm
          profileData={profileData}
          handleProfileChange={handleProfileChange}
          handleProfileUpdate={handleProfileUpdate}
          profileLoading={profileLoading}
          profileError={profileError}
          profileSuccess={profileSuccess}
          isPasswordUpdateInProgress={passwordLoading}
        />
        <PasswordUpdateForm
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmNewPassword={confirmNewPassword}
          setConfirmNewPassword={setConfirmNewPassword}
          handlePasswordUpdate={handlePasswordUpdate}
          passwordLoading={passwordLoading}
          passwordError={passwordError}
          passwordSuccess={passwordSuccess}
        />
      </div>

      {/* Google Calendar Integration Section */}
      <GoogleCalendarSettings
        isGoogleCalendarAuthed={isGoogleCalendarAuthed}
        googleCalLoading={googleCalLoading}
        googleAuthUrl={googleAuthUrl}
      />

      {/* Fitness Status Section */}
      <FitnessStatusForm
        statusData={statusData}
        handleStatusChange={handleStatusChange}
        handleStatusUpdate={handleStatusUpdate}
        statusLoading={statusLoading}
        statusError={statusError}
        statusSuccess={statusSuccess}
      />
    </div>
  );
};

export default ProfilePage;