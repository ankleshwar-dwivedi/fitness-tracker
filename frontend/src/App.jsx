// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Layout & Common
import Navbar from "./components/Layout/Navbar";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";
import AdminProtectedRoute from "./components/Auth/AdminProtectedRoute";
import ChatbotDialog from "./components/Chatbot/ChatbotDialog";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import TodayPage from "./pages/TodayPage";
import ProfilePage from "./pages/ProfilePage";
import MealPlanPage from "./pages/MealPlanPage";
import WorkoutPage from "./pages/WorkoutPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage"; // Import new admin dashboard
import WaterIntakePage from './pages/WaterIntakePage';
// This component handles the final step of the Google OAuth redirect
const GoogleAuthSuccessRedirectHandler = () => {
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  React.useEffect(() => {
    // After the backend sets the cookie and redirects here,
    // we tell the AuthContext to re-verify the session.
    checkAuthStatus(false)
      .then(() => {
        // Once the user state is updated in the context, navigate to the dashboard.
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        console.error("Error verifying session after Google login:", err);
        navigate("/login?error=google_verification_failed", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // IMPORTANT: Empty deps array ensures this runs only ONCE.

  return (
    <div className="flex justify-center items-center h-screen">
      <LoadingSpinner /> Finalizing Sign-In...
    </div>
  );
};

function AppContent() {
  const { user, initialAuthLoading } = useAuth();
  const location = useLocation();

  // Show a global spinner ONLY during the initial app load.
  // After this, individual pages or routes handle their own loading states.
  if (initialAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner /> Loading Application...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 bg-gray-50 min-h-[calc(100vh-4rem)]">
        <Routes>
          {/* Public Routes: Wrapped in PublicRoute to redirect if already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* This redirect handler must remain publicly accessible */}
          <Route
            path="/auth/google/success"
            element={<GoogleAuthSuccessRedirectHandler />}
          />

          {/* Protected User Routes: Wrapped in ProtectedRoute to redirect if not logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<TodayPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
            <Route path="/workouts" element={<WorkoutPage />} />
            <Route path="/water" element={<WaterIntakePage />} />
          </Route>

          {/* Protected Admin Routes: Wrapped to check for admin role */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            {/* Future admin pages go here */}
          </Route>
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />{" "}
            {/* New Admin Dashboard Route */}
            <Route path="/admin/users" element={<UserManagementPage />} />
          </Route>
          {/* Fallback for any unmatched route */}
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/"} replace />}
          />
          <Route
            path="*"
            element={
              <Navigate
                to={
                  user
                    ? user.isAdmin
                      ? "/admin/dashboard"
                      : "/dashboard"
                    : "/"
                }
                replace
              />
            }
          />
        </Routes>
      </main>
      {/* Conditionally render Chatbot for guests on landing page or for any logged-in user */}
      {(user || (location.pathname === "/" && !initialAuthLoading)) && (
        <ChatbotDialog limitedAccess={!user && location.pathname === "/"} />
      )}
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
