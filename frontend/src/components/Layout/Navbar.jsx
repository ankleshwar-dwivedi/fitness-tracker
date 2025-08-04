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
    navigate('/login');
  };

  const activeStyle = "text-white font-semibold border-b-2 border-white";
  const inactiveStyle = "text-white hover:text-orange-500 hover:scale-125 hover:scale-115 hover:scale-115 hover:scale-115 hover:scale-115 hover:scale-105";
  const navLinkClass = ({ isActive }) => `${isActive ? activeStyle : inactiveStyle} px-3 py-2 text-sm font-medium transition`;

  return (
    
    <nav className=" bg-indigo-700 shadow-md sticky top-0 z-40 bg-opacity-0.7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left - Home and Admin Dashboard (if admin) */}
          <div className="flex items-center space-x-4">
            <NavLink to="/" className="flex-shrink-0 flex items-center text-5xl sm:text-5xl font-semibold text-orange-500 tracking-wide">

              FitTrack
            </NavLink>
            {user?.isAdmin && (
              <NavLink to="/admin/dashboard" className="text-lg font-medium text-white hover:text-blue-100 transition">
                Admin Dashboard
              </NavLink>
            )}
          </div>

          {/* Center - FitTrack Title */}
          

          {/* Right - Auth Links or User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Regular User or Admin Options */}
                {!user.isAdmin && (
                  <>
                    <NavLink to="/dashboard" className={navLinkClass}>Today</NavLink>
                    <NavLink to="/meal-plan" className={navLinkClass}>Meal Plan</NavLink>
                    <NavLink to="/workouts" className={navLinkClass}>Workouts</NavLink>
                    <NavLink to="/water" className={navLinkClass}>Water</NavLink>
                    <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                  </>
                )}

                <div className="h-6 w-px bg-white" />
                <span className="text-white text-sm hidden md:block">Hi, {user.name}!</span>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="text-sm"
                  isLoading={actionLoading}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
              <div className="flex items-center space-x-16">

                <NavLink to="/login" className="text-lg font-medium text-white hover:text-orange-500 hover:scale-125 hover:scale-115 hover:scale-115 hover:scale-115 hover:scale-105  transition">
                  Login
                </NavLink>
                <NavLink to="/register" className="text-lg font-medium text-white hover:text-orange-500 hover:scale-125 hover:scale-115 hover:scale-115 hover:scale-115 hover:scale-105 transition">
                  Register
                </NavLink>
                </div>

              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
