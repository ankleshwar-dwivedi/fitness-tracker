// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Common/Button';

const Navbar = () => {
  const { user, logout, actionLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect to login after logout
  };

  const activeStyle = "text-indigo-600 font-semibold border-b-2 border-indigo-600";
  const inactiveStyle = "text-gray-600 hover:text-indigo-600";
  const navLinkClass = ({ isActive }) => `${isActive ? activeStyle : inactiveStyle} px-3 py-2 text-sm font-medium transition`;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold text-indigo-600">
              FitTrack
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* --- Conditional Links Based on Role --- */}
                {user.isAdmin ? (
                  <>
                    {/* Admin Links */}
                    <NavLink to="/admin/dashboard" className={navLinkClass}>Admin Dashboard</NavLink>
                    <NavLink to="/admin/users" className={navLinkClass}>Manage Users</NavLink>
                  </>
                ) : (
                  <>
                    {/* Regular User Links */}
                    <NavLink to="/dashboard" className={navLinkClass}>Today</NavLink>
                    <NavLink to="/meal-plan" className={navLinkClass}>Meal Plan</NavLink>
                    <NavLink to="/workouts" className={navLinkClass}>Workouts</NavLink>
                    <NavLink to="/water" className={navLinkClass}>Water</NavLink>
                    <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                  </>
                )}
                
                <div className="h-6 w-px bg-gray-300" />
                <span className="text-gray-700 text-sm hidden md:block">Hi, {user.name}!</span>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="text-sm" isLoading={actionLoading}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                <NavLink to="/register" className={navLinkClass}>Register</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;