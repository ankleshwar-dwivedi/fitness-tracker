// src/pages/Admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminAnalytics } from '../../lib/apiClient';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AdminDashboardPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getAdminAnalytics();
                setAnalytics(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Could not load analytics.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
                    <p className="text-4xl font-bold text-indigo-600">{analytics?.totalUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">Meal Plans Logged</h3>
                    <p className="text-4xl font-bold text-green-600">{analytics?.totalMealPlansLogged}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-600">Workouts Logged</h3>
                    <p className="text-4xl font-bold text-red-600">{analytics?.totalWorkoutsLogged}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
                <div className="flex space-x-4">
                    <Link to="/admin/users" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
                        Manage Users
                    </Link>
                    {/* Add more links as you create more admin pages */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;