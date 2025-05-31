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

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ChatbotDialog from './components/Chatbot/ChatbotDialog'; // Import Chatbot

function AppContent() {
  const { user, loading } = useAuth();

  if (loading && !user && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      // If loading and not on public auth pages, don't render routes yet to avoid flashes
      return (
        <div className="flex justify-center items-center h-screen">
          {/* You might want a more global loading spinner here from AuthContext */}
        </div>
      );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16"> {/* Add padding top to avoid content going under fixed navbar */}
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/meal-plan" element={<MealPlanPage />} />
          </Route>

          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
      {user && <ChatbotDialog />} {/* Render ChatbotDialog if user is logged in */}
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