// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import Navbar from './components/Layout/Navbar';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MealPlanPage from './pages/MealPlanPage';
// import NotFoundPage from './pages/NotFoundPage'; // Optional

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';

function AppContent() {
  const { user, loading } = useAuth();

  // Optional: Redirect root path based on auth status
  // If still loading auth status, maybe show nothing or a loader?
  if (loading && !user) {
      return null; // Or a global loading indicator
  }

  return (
    <>
      <Navbar />
      <main className="pt-16"> {/* Add padding top to avoid content going under fixed navbar */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

           {/* Redirect root based on auth */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />


          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
             {/* Add other protected routes here */}
          </Route>

          {/* Fallback 404 Route - Optional */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
           <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} /> {/* Or redirect to home/login */}

        </Routes>
      </main>
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