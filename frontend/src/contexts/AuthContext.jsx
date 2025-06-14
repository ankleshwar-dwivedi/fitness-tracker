// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getProfile, loginUser as apiLogin, logoutUser as apiLogout, registerUser as apiRegister } from '../lib/apiClient';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // This 'loading' is specifically for the *initial application load* auth check.
  const [initialAuthLoading, setInitialAuthLoading] = useState(true);
  // This 'actionLoading' is for specific actions like login, register, logout.
  const [actionLoading, setActionLoading] = useState(false);
  const [authActionError, setAuthActionError] = useState(null);

  // Stable reference for checkAuthStatus, runs once on mount to check existing session.
  // Can also be called manually after Google Sign-In success.
  const checkAuthStatus = useCallback(async (isInitialCheck = false) => {
    if (isInitialCheck) {
      // console.log("AuthContext: Initial auth check started.");
      setInitialAuthLoading(true);
    } else {
      // console.log("AuthContext: Manual auth check started (e.g., post-Google sign-in).");
      // For manual checks, we might not want to show the global initialAuthLoading spinner,
      // but rather a specific spinner where the action was triggered.
      // However, it's okay for it to also use actionLoading if that's simpler.
      // setActionLoading(true); // Or rely on calling component's loading state
    }
    try {
      const response = await getProfile();
      setUser(response.data);
      // console.log("AuthContext: User session validated/restored:", response.data.name);
    } catch (err) {
      setUser(null); // No active session or error
      // console.log("AuthContext: No active session or error fetching profile.");
    } finally {
      if (isInitialCheck) {
        setInitialAuthLoading(false);
        // console.log("AuthContext: Initial auth check finished.");
      } else {
        // setActionLoading(false);
      }
    }
  }, []); // Empty dependency array makes this function reference stable

  useEffect(() => {
    checkAuthStatus(true); // Perform initial check on component mount
  }, [checkAuthStatus]); // `checkAuthStatus` is stable

  const login = async (email, password) => {
    setActionLoading(true);
    setAuthActionError(null);
    try {
      const response = await apiLogin({ email, password });
      setUser(response.data);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthActionError(errorMessage);
      setUser(null); // Ensure user is null on failed login
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setActionLoading(true);
    setAuthActionError(null);
    try {
      const response = await apiRegister({ name, email, password });
      setUser(response.data);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthActionError(errorMessage);
      setUser(null);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    setActionLoading(true);
    setAuthActionError(null); // Clear previous errors
    try {
      await apiLogout(); // Call backend to clear cookie
      // console.log("AuthContext: Logout API call successful.");
    } catch (err) {
      // Even if API call fails (e.g., network issue, server down),
      // proceed to clear client-side state.
      console.error("Logout API failed:", err.response?.data?.message || err.message);
      // You might want to set an error message if the API call fails,
      // but typically, client-side logout should still proceed.
      // setAuthActionError("Logout failed on server, but you are logged out locally.");
    } finally {
      setUser(null); // Clear user state on client
      setActionLoading(false);
      // console.log("AuthContext: Client-side logout complete.");
    }
  };

  // Show global spinner ONLY during the very initial app load auth check AND if no user is yet determined.
  if (initialAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner /> Initializing FitTrack...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, initialAuthLoading, actionLoading, authActionError, login, logout, register, checkAuthStatus, setAuthActionError }}>
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