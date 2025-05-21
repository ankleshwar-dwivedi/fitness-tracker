// src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading user data...</p>; // Or a loading spinner
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}!</h1>
      <p className="mb-4">This is your fitness dashboard. From here you can manage your profile, track meals, and monitor your water intake.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card for Profile */}
        <Link to="/profile" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">Manage Profile</h2>
          <p className="text-gray-600">View and update your personal details and fitness status.</p>
        </Link>

        {/* Card for Meal Plan */}
         <Link to="/meal-plan" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-2 text-green-600">Track Meals & Water</h2>
          <p className="text-gray-600">Log your daily meals and water consumption.</p>
        </Link>

        {/* Add more cards/widgets as needed */}
         <div className="p-6 bg-white rounded-lg shadow">
           <h2 className="text-xl font-semibold mb-2 text-purple-600">Quick Stats</h2>
           <p className="text-gray-600">Summary of today's progress (feature coming soon!).</p>
           {/* You could fetch and display quick stats here later */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;