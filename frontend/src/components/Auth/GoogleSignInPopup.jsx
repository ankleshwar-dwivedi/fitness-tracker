// src/components/Auth/GoogleSignInPopup.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // To check if already logged in
import Button from '../Common/Button';

const GoogleSignInPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user, loading: authLoading } = useAuth(); // Check if user is already logged in or auth is loading

  useEffect(() => {
    if (user || authLoading) { // If user logs in through other means, or auth still loading, hide/don't show
      setIsVisible(false);
      return;
    }

    // Optional: Check if popup has been dismissed recently
    const lastDismissed = localStorage.getItem('googleSignInPopupDismissedTimestamp');
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours
    if (lastDismissed && (Date.now() - parseInt(lastDismissed, 10) < twentyFourHours)) {
      // console.log("Google Sign-In Popup: Dismissed recently, not showing.");
      return; // Don't show if dismissed within the last 24 hours
    }

    const timer = setTimeout(() => {
      // Final check before showing
      if (!user && !authLoading) {
        // console.log("Google Sign-In Popup: Showing.");
        setIsVisible(true);
      }
    }, 3000); // Show after 3 seconds (adjust as needed)

    return () => clearTimeout(timer); // Cleanup timer on component unmount or re-render
  }, [user, authLoading]); // Re-run if user or authLoading state changes

  const handleGoogleSignIn = () => {
    // This URL should point to your backend endpoint that initiates Google OAuth
    const googleAuthUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5123'}/api/auth/google`;
    window.location.href = googleAuthUrl; // Redirect the main window to start the flow
    setIsVisible(false); // Hide popup after initiating
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 24 hours (optional)
    localStorage.setItem('googleSignInPopupDismissedTimestamp', Date.now().toString());
  };

  // Do not render if not visible, or if user is logged in, or if auth is still in its initial loading phase
  if (!isVisible || user || authLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 bg-white p-5 rounded-lg shadow-2xl z-[100] w-auto max-w-sm border border-gray-200 animate-slide-in-right-subtle">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-2xl font-light"
        aria-label="Dismiss Google Sign-In Prompt"
      >
        ×
      </button>
      <div className="flex items-start mb-3">
        <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
            alt="Google G"
            className="w-7 h-7 mr-3 mt-1 flex-shrink-0"
        />
        <div>
            <h3 className="text-lg font-semibold text-gray-700">Sign in with Google</h3>
            <p className="text-sm text-gray-500 mt-1">
                Access FitTrack quickly and securely using your Google account.
            </p>
        </div>
      </div>
      <Button
        onClick={handleGoogleSignIn}
        variant="primary" // Your primary button style
        className="w-full mt-2 py-2.5 text-sm font-medium" // Adjust styling as needed
      >
        Continue with Google
      </Button>
       {/* <p className="text-xs text-gray-400 mt-2 text-center">
        We'll use your Google email and name for your FitTrack profile.
      </p> */}
    </div>
  );
};

export default GoogleSignInPopup;