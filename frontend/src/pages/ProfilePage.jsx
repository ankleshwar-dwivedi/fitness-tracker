// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, getStatus, updateStatus } from '../lib/apiClient';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ProfilePage = () => {
  const { user, checkAuthStatus } = useAuth(); // Get checkAuthStatus to update user context if name changes

  // Profile State
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Status State
  const [statusData, setStatusData] = useState({
    height: '',
    weight: '',
    goalWeight: '',
    age: '',
    gender: '',
    activityLevel: '',
    goal: ''
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  // Fetch initial data
  useEffect(() => {
    const fetchUserData = async () => {
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
        setStatusData(statusRes.data || { // Handle case where status might not exist yet
             height: '', weight: '', goalWeight: '', age: '', gender: '', activityLevel: '', goal: ''
        });
      } catch (err) {
         if (err.response && err.response.status === 404) {
             console.log("No status found, user can create one.");
             // Keep default empty state
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
  }, [user]); // Re-fetch if user changes (though unlikely here)

  // Handlers
  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (e) => {
    setStatusData({ ...statusData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    setNewPassword('');
    setConfirmNewPassword('');

    const payload = { name: profileData.name };

    try {
      const response = await updateProfile(payload);
      setProfileData({ name: response.data.name, email: response.data.email }); // Update local state with response
      await checkAuthStatus(); // Re-check auth to update user name in AuthContext/Navbar
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000); // Clear success message
    } catch (err) {
      console.error("Failed to update profile:", err);
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
    if (!newPassword) {
        setProfileError('Please enter a new password.');
        return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    const payload = { password: newPassword };

    try {
      await updateProfile(payload);
      setProfileSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setProfileSuccess(''), 3000); // Clear success message
    } catch (err) {
      console.error("Failed to update password:", err);
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

    // Convert numeric fields from string input to numbers
    const payload = {
        ...statusData,
        height: statusData.height ? Number(statusData.height) : null,
        weight: statusData.weight ? Number(statusData.weight) : null,
        goalWeight: statusData.goalWeight ? Number(statusData.goalWeight) : null,
        age: statusData.age ? Number(statusData.age) : null,
    };
    // Remove null fields if backend expects them to be absent rather than null
    Object.keys(payload).forEach(key => payload[key] === null && delete payload[key]);


    try {
      const response = await updateStatus(payload);
      setStatusData(response.data); // Update local state with response
      setStatusSuccess('Status updated successfully!');
       setTimeout(() => setStatusSuccess(''), 3000); // Clear success message
    } catch (err) {
      console.error("Failed to update status:", err);
      setStatusError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  };

  if (!user) return <LoadingSpinner />; // Should be handled by ProtectedRoute, but good fallback

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile & Status</h1>

      {/* Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
        {profileError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{profileError}</p>}
        {profileSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{profileSuccess}</p>}

        <form onSubmit={handleProfileUpdate} className="space-y-4 mb-6 pb-6 border-b">
           <Input
            id="name"
            name="name" // Ensure name matches state key
            label="Full Name"
            type="text"
            value={profileData.name}
            onChange={handleProfileChange}
            required
          />
          <Input
            id="email"
            name="email" // Ensure name matches state key
            label="Email Address"
            type="email"
            value={profileData.email}
            readOnly // Email is usually not changeable or requires verification
            className="bg-gray-100 cursor-not-allowed"
          />
           <Button type="submit" isLoading={profileLoading && !newPassword} disabled={profileLoading}>
             Update Name
           </Button>
        </form>

        <h3 className="text-xl font-semibold mb-4">Update Password</h3>
         <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
            />
          <Input
            id="confirmNewPassword"
            label="Confirm New Password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm new password"
            />
           <Button type="submit" isLoading={profileLoading && !!newPassword} disabled={profileLoading || !newPassword}>
             Update Password
           </Button>
        </form>
      </div>


      {/* Status Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Fitness Status</h2>
         {statusError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{statusError}</p>}
         {statusSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{statusSuccess}</p>}
        <form onSubmit={handleStatusUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="height" name="height" label="Height (cm)" type="number"
            value={statusData.height || ''} onChange={handleStatusChange} placeholder="e.g., 175"
          />
          <Input
            id="weight" name="weight" label="Current Weight (kg)" type="number" step="0.1"
            value={statusData.weight || ''} onChange={handleStatusChange} placeholder="e.g., 70.5"
          />
          <Input
            id="goalWeight" name="goalWeight" label="Goal Weight (kg)" type="number" step="0.1"
            value={statusData.goalWeight || ''} onChange={handleStatusChange} placeholder="e.g., 68"
          />
          <Input
            id="age" name="age" label="Age" type="number"
            value={statusData.age || ''} onChange={handleStatusChange} placeholder="e.g., 30"
          />
          <div className="mb-4">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              id="gender" name="gender" value={statusData.gender || ''} onChange={handleStatusChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="preferNotToSay">Prefer not to say</option>
            </select>
          </div>
           <div className="mb-4">
            <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
            <select
              id="activityLevel" name="activityLevel" value={statusData.activityLevel || ''} onChange={handleStatusChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Activity Level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightlyActive">Lightly Active (light exercise/sports 1-3 days/week)</option>
              <option value="moderatelyActive">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
              <option value="veryActive">Very Active (hard exercise/sports 6-7 days a week)</option>
              <option value="extraActive">Extra Active (very hard exercise/sports & physical job)</option>
            </select>
          </div>
           <div className="mb-4 md:col-span-2">
             <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Primary Goal</label>
             <select
               id="goal" name="goal" value={statusData.goal || ''} onChange={handleStatusChange}
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select Goal</option>
              <option value="Cutting">Weight Loss (Cutting)</option>
              <option value="Maintenance">Weight Maintenance</option>
              <option value="Bulking">Weight Gain (Bulking)</option>
              <option value="Fitness">General Fitness</option>
            </select>
          </div>

          <div className="md:col-span-2">
             <Button type="submit" variant="primary" className="w-full md:w-auto" isLoading={statusLoading} disabled={statusLoading}>
              Update Status
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;