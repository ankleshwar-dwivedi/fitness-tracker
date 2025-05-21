// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Common/Button';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect to login after logout
  };

  const activeStyle = "text-blue-600 font-semibold border-b-2 border-blue-600";
  const inactiveStyle = "text-gray-600 hover:text-blue-600";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold text-blue-600">
              {/* Optional Logo */}
              {/* <img className="h-8 w-auto mr-2" src="/logo.png" alt="Logo" /> */}
              FitTrack
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `${isActive ? activeStyle : inactiveStyle} px-3 py-2 text-sm font-medium transition`}
                >
                  Dashboard
                </NavLink>
                 <NavLink
                  to="/meal-plan"
                  className={({ isActive }) => `${isActive ? activeStyle : inactiveStyle} px-3 py-2 text-sm font-medium transition`}
                >
                  Meal Plan
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `${isActive ? activeStyle : inactiveStyle} px-3 py-2 text-sm font-medium transition`}
                >
                  Profile
                </NavLink>
                <span className="text-gray-700 text-sm hidden md:block">Hi, {user.name}!</span>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="text-sm" isLoading={loading}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `${isActive ? activeStyle : inactiveStyle} px-3 py-2 text-sm font-medium transition`}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) => `${isActive ? activeStyle : inactiveStyle} px-3 py-2 text-sm font-medium transition`}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;