// /backend/src/features/admin/admin.routes.js
import express from 'express';
const router = express.Router();
import { protect } from '../../middleware/auth.middleware.js';
import { admin } from '../../middleware/admin.middleware.js'; // Your admin check middleware
import {
    getAllUsers,
    getUserByIdAsAdmin,
    updateUserAsAdmin,
    adminResetUserPassword,
    deleteUserAsAdmin,
    getApplicationStats
} from './admin.controller.js';

// Dashboard Stats
router.get('/stats', protect, admin, getApplicationStats);

// User Management
router.route('/users')
    .get(protect, admin, getAllUsers);

router.route('/users/:id')
    .get(protect, admin, getUserByIdAsAdmin)
    .put(protect, admin, updateUserAsAdmin)
    .delete(protect, admin, deleteUserAsAdmin);

router.post('/users/:id/reset-password', protect, admin, adminResetUserPassword);

export default router;