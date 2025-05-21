// src/components/Auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
     // Optional: Show a loading indicator while checking auth status
     return (
       <div className="flex justify-center items-center h-screen">
         <LoadingSpinner />
       </div>
     );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the child route content
  return <Outlet />;
};

export default ProtectedRoute;