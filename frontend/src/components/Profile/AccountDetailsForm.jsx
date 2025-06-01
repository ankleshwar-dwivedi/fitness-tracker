// src/components/Profile/AccountDetailsForm.jsx
import React from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';

const AccountDetailsForm = ({
  profileData,
  handleProfileChange,
  handleProfileUpdate,
  profileLoading,
  profileError,
  profileSuccess,
  isPasswordUpdateInProgress // To disable button if password form is also loading
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
      {profileError && !profileError.includes("password") && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{profileError}</p>}
      {profileSuccess && !profileSuccess.includes("password") && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{profileSuccess}</p>}

      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <Input
          id="name"
          name="name"
          label="Full Name"
          type="text"
          value={profileData.name}
          onChange={handleProfileChange}
          required
        />
        <Input
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={profileData.email}
          readOnly // Email is usually not changeable or requires verification
          className="bg-gray-100 cursor-not-allowed"
        />
        <Button
          type="submit"
          isLoading={profileLoading && !isPasswordUpdateInProgress}
          disabled={profileLoading || isPasswordUpdateInProgress}
        >
          Update Name
        </Button>
      </form>
    </div>
  );
};

export default AccountDetailsForm;