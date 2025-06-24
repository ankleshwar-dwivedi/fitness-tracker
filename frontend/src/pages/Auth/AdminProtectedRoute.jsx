// /frontend/src/components/Auth/AdminProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const AdminProtectedRoute = () => {
  const { user, initialAuthLoading } = useAuth(); // Use initialAuthLoading
  const location = useLocation();

  if (initialAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen pt-16">
        <LoadingSpinner /> Checking admin access...
      </div>
    );
  }

  if (!user) {
    // User not logged in, redirect to login, preserving intended path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isAdmin) {
    // User is logged in but not an admin, redirect to dashboard or an "access denied" page
    console.warn("AdminProtectedRoute: User is not an admin. Redirecting.");
    return <Navigate to="/dashboard" replace />; // Or to a dedicated /access-denied page
  }

  // User is logged in AND is an admin, render the child route
  return <Outlet />;
};

export default AdminProtectedRoute;