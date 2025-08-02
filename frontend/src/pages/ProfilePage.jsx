// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, getStatus, updateStatus, getGoogleCalendarAuthStatus } from '../lib/apiClient';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button'; // CORRECTED FIX: Added missing import for Button
import AccountDetailsForm from '../components/Profile/AccountDetailsForm';
import PasswordUpdateForm from '../components/Profile/PasswordUpdateForm';
import GoogleCalendarSettings from '../components/Profile/GoogleCalendarSettings';
import FitnessStatusForm from '../components/Profile/FitnessStatusForm';
import Modal from '../components/Common/Modal';

const ProfilePage = () => {
  const { user, checkAuthStatus } = useAuth();

  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const defaultStatus = { height: '', weight: '', goalWeight: '', age: '', gender: '', activityLevel: '', goal: '' };
  const [statusData, setStatusData] = useState(defaultStatus);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  const [isGoogleCalendarAuthed, setIsGoogleCalendarAuthed] = useState(false);
  const [googleCalLoading, setGoogleCalLoading] = useState(true);
  const [googleCalMessage, setGoogleCalMessage] = useState('');
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5123';
  const googleAuthUrl = `${backendBaseUrl}/api/google-calendar/authorize`;

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true); setStatusLoading(true); setGoogleCalLoading(true);
    try {
      // Run fetches in parallel for better performance
      const [profileRes, statusRes, gcalRes] = await Promise.all([
        getProfile(),
        getStatus().catch(err => err), // Catch 404s so Promise.all doesn't fail
        getGoogleCalendarAuthStatus().catch(err => err)
      ]);
      setProfileData(profileRes.data || { name: '', email: '' });
      if (statusRes.response && statusRes.response.status === 404) {
        console.log("No fitness status found for user.");
        setStatusData(defaultStatus);
      } else if (statusRes.data) {
        setStatusData(prev => ({ ...defaultStatus, ...statusRes.data }));
      } else {
        setStatusError("Failed to load fitness status data.");
      }
      if (gcalRes.data) {
        setIsGoogleCalendarAuthed(gcalRes.data.isGoogleCalendarAuthorized);
      } else {
        console.error("Failed to fetch GCal status");
      }
    } catch (err) {
      console.error("Error fetching page data:", err);
      setProfileError("Failed to load page data.");
    } finally {
      setProfileLoading(false); setStatusLoading(false); setGoogleCalLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('google-auth') === 'success') {
      setGoogleCalMessage('Successfully connected to Google Calendar!');
      window.history.replaceState({}, document.title, "/profile");
    } else if (queryParams.get('google-auth') === 'error') {
      setGoogleCalMessage(`Google Calendar connection failed: ${queryParams.get('message') || 'Unknown error'}`);
      window.history.replaceState({}, document.title, "/profile");
    }
    fetchInitialData();
  }, [fetchInitialData]);

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handleStatusChange = (e) => setStatusData({ ...statusData, [e.target.name]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true); setProfileError(''); setProfileSuccess('');
    try {
      const res = await updateProfile({ name: profileData.name });
      setProfileData(res.data);
      await checkAuthStatus();
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
    if (newPassword !== confirmNewPassword) { setPasswordError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    setPasswordLoading(true); setPasswordError(''); setPasswordSuccess('');
    try {
      await updateProfile({ password: newPassword });
      setPasswordSuccess('Password updated successfully!');
      setIsPasswordModalOpen(false);
      setNewPassword(''); setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setStatusLoading(true); setStatusError(''); setStatusSuccess('');
    const payload = { ...statusData };
    Object.keys(payload).forEach(key => {
        if (['height', 'weight', 'goalWeight', 'age'].includes(key)) payload[key] = Number(payload[key]) || null;
    });
    try {
      const res = await updateStatus(payload);
      setStatusData(res.data);
      setStatusSuccess('Fitness status updated successfully!');
      setTimeout(() => setStatusSuccess(''), 3000);
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };
  
  if (profileLoading || statusLoading) {
      return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>
      {googleCalMessage && <p className="p-3 rounded mb-4 text-sm bg-green-100 text-green-700">{googleCalMessage}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <AccountDetailsForm
          profileData={profileData} handleProfileChange={handleProfileChange} handleProfileUpdate={handleProfileUpdate}
          profileLoading={profileLoading} profileError={profileError} profileSuccess={profileSuccess}
          isPasswordUpdateInProgress={passwordLoading}
        />
        <div className="pt-6 border-t">
            <Button onClick={() => setIsPasswordModalOpen(true)} variant="secondary">Change Password</Button>
        </div>
      </div>
      
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Update Password">
        <PasswordUpdateForm
            newPassword={newPassword} setNewPassword={setNewPassword}
            confirmNewPassword={confirmNewPassword} setConfirmNewPassword={setConfirmNewPassword}
            handlePasswordUpdate={handlePasswordUpdate} passwordLoading={passwordLoading}
            passwordError={passwordError} passwordSuccess={passwordSuccess}
        />
      </Modal>

      <GoogleCalendarSettings isGoogleCalendarAuthed={isGoogleCalendarAuthed} googleCalLoading={googleCalLoading} googleAuthUrl={googleAuthUrl} />
      
      <FitnessStatusForm
        statusData={statusData} handleStatusChange={handleStatusChange} handleStatusUpdate={handleStatusUpdate}
        statusLoading={statusLoading} statusError={statusError} statusSuccess={statusSuccess}
      />
    </div>
  );
};

export default ProfilePage;