// src/components/Auth/PublicRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = () => {
  const { user, initialAuthLoading } = useAuth();

  // Wait until the initial authentication check is complete before deciding where to route.
  if (initialAuthLoading) {
    return null; // Render nothing while checking. AuthProvider shows the global spinner.
  }

  // If the initial check is done and a user exists, redirect them away from public-only pages
  // (like Login or Landing) to the main dashboard.
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // If the initial check is done and there is no user, render the requested public page
  // (e.g., the Outlet will be <LoginPage> or <LandingPage>).
  return <Outlet />;
};

export default PublicRoute;