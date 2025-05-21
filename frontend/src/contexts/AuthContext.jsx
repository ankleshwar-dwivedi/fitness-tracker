// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getProfile, loginUser as apiLogin, logoutUser as apiLogout, registerUser as apiRegister } from '../lib/apiClient';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Track initial auth check
  const [error, setError] = useState(null); // Store login/register errors

  // Check if user is already logged in (e.g., JWT cookie exists)
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    try {
      // Try fetching profile - if successful, user is logged in
      const response = await getProfile();
      setUser(response.data); // Assuming response.data contains user info { id, name, email }
    } catch (err) {
      // Ignore errors here (likely 401 if not logged in), clear user state
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin({ email, password });
      setUser(response.data); // Set user state after successful login
      return true; // Indicate success
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setUser(null);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
     setLoading(true);
    setError(null);
    try {
      const response = await apiRegister({ name, email, password });
      setUser(response.data); // Set user state after successful registration
      return true; // Indicate success
    } catch (err) {
      console.error("Registration failed:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setUser(null);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiLogout();
      setUser(null); // Clear user state
    } catch (err) {
      console.error("Logout failed:", err.response?.data?.message || err.message);
      // Even if API fails, clear local state
      setUser(null);
      setError(err.response?.data?.message || 'Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner during initial check
  if (loading && user === null) {
     return (
       <div className="flex justify-center items-center h-screen">
         <LoadingSpinner />
       </div>
     );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, checkAuthStatus, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};