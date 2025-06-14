// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ChatbotDialog from './components/Chatbot/ChatbotDialog';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MealPlanPage from './pages/MealPlanPage';

// This component handles the redirect FROM Google OAuth AFTER backend has processed the code.
// Its sole job is to trigger a re-check of auth status in AuthContext and then navigate.
const GoogleAuthSuccessRedirectHandler = () => {
    const { checkAuthStatus } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // console.log("GoogleAuthSuccessRedirectHandler: Mounted. Triggering auth status check.");
        // The backend has set the JWT cookie. Now, tell AuthContext to verify it.
        checkAuthStatus(false) // Pass false: this is not the *initial* app load check
            .then(() => {
                // console.log("GoogleAuthSuccessRedirectHandler: Auth status re-checked. Navigating to dashboard.");
                navigate('/dashboard', { replace: true });
            })
            .catch(err => {
                console.error("GoogleAuthSuccessRedirectHandler: Error during post-Google-auth status check:", err);
                navigate('/login?error=google_session_verification_failed', { replace: true });
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // CRITICAL: Empty deps array. This effect runs ONLY ONCE on mount.

    return (
        <div className="flex flex-col justify-center items-center min-h-screen pt-16">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Finalizing Google Sign-In...</p>
        </div>
    );
};

function AppContent() {
  // `initialAuthLoading` from useAuth() is true ONLY during the very first app-wide auth check.
  // `user` is null until that check completes or if user is not logged in.
  const { user, initialAuthLoading } = useAuth();
  const location = useLocation();

  // If AuthContext is performing its initial load, show a global loading state.
  // This prevents routes from rendering/redirecting prematurely.
  if (initialAuthLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Optionally show Navbar even during this initial load if it doesn't depend on user state for core rendering */}
            {/* <Navbar /> */}
            <main className="flex-grow flex justify-center items-center pt-16">
                <LoadingSpinner /> Loading Application...
            </main>
        </div>
    );
  }

  // Once initialAuthLoading is false, we know the initial user state (null or user object).
  return (
    <>
      <Navbar /> {/* Navbar can now safely access `user` from useAuth() */}
      <main className="pt-16 bg-gray-50 min-h-[calc(100vh-4rem)]"> {/* Ensure main content area fills viewport */}
        <Routes>
          {/* Publicly accessible routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccessRedirectHandler />} />

          {/* Protected Routes - these will be rendered if `user` is truthy */}
          <Route element={<ProtectedRoute />}> {/* ProtectedRoute also checks user & loading */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
            {/* Add Admin Routes here later, wrapped in an AdminProtectedRoute if needed */}
            {/* e.g., <Route path="/admin" element={<AdminProtectedRoute />} > <Route path="dashboard" element={<AdminDashboardPage />} /> </Route> */}
          </Route>

          {/* Fallback for any unmatched routes */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
        </Routes>
      </main>
      {/* Chatbot: Render if user is logged in, OR if on landing page (for guest access) */}
      { (user || (location.pathname === '/' && !initialAuthLoading)) &&
        <ChatbotDialog limitedAccess={!user && location.pathname === '/'} />
      }
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
         <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;