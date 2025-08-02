// src/pages/Admin/UserManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers, deleteUserById, resetUserPassword } from '../../lib/apiClient';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import { useAuth } from '../../contexts/AuthContext';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user: adminUser } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', isError: false });

    const fetchUsers = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const showFeedback = (message, isError = false) => {
        setFeedback({ message, isError });
        setTimeout(() => setFeedback({ message: '', isError: false }), 4000);
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to permanently delete user: ${userName}? This action cannot be undone.`)) return;
        setActionLoading(true);
        try {
            const res = await deleteUserById(userId);
            showFeedback(res.data.message);
            await fetchUsers(); // Refresh user list
        } catch (err) {
            showFeedback(err.response?.data?.message || 'Failed to delete user.', true);
        } finally {
            setActionLoading(false);
        }
    };

    const openResetPasswordModal = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setIsModalOpen(true);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        setActionLoading(true);
        try {
            const res = await resetUserPassword(selectedUser._id, newPassword);
            setIsModalOpen(false);
            showFeedback(res.data.message || `Password for ${selectedUser.name} has been reset.`);
        } catch (err) {
            showFeedback(err.response?.data?.message || 'Failed to reset password.', true);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center"><LoadingSpinner /></div>;
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin: User Management</h1>
            
            {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
            {feedback.message && <p className={`${feedback.isError ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'} p-3 rounded mb-4 transition-opacity duration-300`}>{feedback.message}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
                            <th className="px-5 py-3 border-b-2 border-gray-200">User</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200">Role</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200">Joined On</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap font-semibold">{user.name}</p>
                                    <p className="text-gray-600 whitespace-no-wrap">{user.email}</p>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-indigo-200 text-indigo-800' : 'bg-green-200 text-green-800'}`}>
                                        {user.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <Button onClick={() => openResetPasswordModal(user)} variant="secondary" className="text-xs py-1 px-2">Reset Pass</Button>
                                        {/* Prevent admin from deleting themselves */}
                                        {!user.isAdmin && user._id !== adminUser._id && (
                                            <Button onClick={() => handleDeleteUser(user._id, user.name)} variant="danger" className="text-xs py-1 px-2">Delete</Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Reset Password for ${selectedUser?.name}`}>
                <form onSubmit={handleResetPassword}>
                    <Input id="newPassword" label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">Cancel</Button>
                        <Button type="submit" isLoading={actionLoading} disabled={actionLoading}>Confirm Reset</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;