import express from 'express';
const router = express.Router();
import { protect } from '../../middleware/auth.middleware.js';
import { admin } from '../../middleware/admin.middleware.js';
// Import your admin controller functions here
// Example: import { getAllUsersStats, approveModification } from './admin.controller.js';


// Placeholder for controller functions (these would be in admin.controller.js)
const getAllUsersStats = async (req, res) => {
    // const users = await User.find({}).select('-password'); // Example: Fetch all users
    // const stats = { totalUsers: users.length, /* other stats */ };
    res.json({ message: 'Admin: User statistics', stats: { totalUsers: 0 } });
};
const approveModification = async (req, res) => {
    res.json({ message: 'Admin: Modification approved' });
};


router.get('/stats', protect, admin, getAllUsersStats);
// router.post('/features/:featureId/approve', protect, admin, approveModification);

export default router;