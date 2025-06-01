// src/components/Profile/PasswordUpdateForm.jsx
import React from 'react';
import Input from '../Common/Input';
import Button from '../Common/Button';

const PasswordUpdateForm = ({
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  handlePasswordUpdate,
  passwordLoading, // Specific loading state for password
  passwordError,   // Specific error state for password
  passwordSuccess  // Specific success state for password
}) => {
  return (
    <div className="pt-6 border-t">
      <h3 className="text-xl font-semibold mb-4">Update Password</h3>
      {passwordError && <p className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4">{passwordError}</p>}
      {passwordSuccess && <p className="text-sm text-green-600 bg-green-100 p-3 rounded mb-4">{passwordSuccess}</p>}
      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <Input
          id="newPassword"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Leave blank to keep current"
        />
        <Input
          id="confirmNewPassword"
          label="Confirm New Password"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="Confirm new password"
        />
        <Button
          type="submit"
          isLoading={passwordLoading}
          disabled={passwordLoading || (!newPassword && !confirmNewPassword)}
        >
          Update Password
        </Button>
      </form>
    </div>
  );
};

export default PasswordUpdateForm;