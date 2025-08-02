// /backend/src/features/admin/admin.routes.js
import express from 'express';
const router = express.Router();
import { protect } from '../../middleware/auth.middleware.js';
import { admin } from '../../middleware/admin.middleware.js';
import { getAllUsers, deleteUser, resetUserPassword, getAnalytics } from './admin.controller.js';

// User Management
router.route('/users')
    .get(protect, admin, getAllUsers);

router.route('/users/:id')
    .delete(protect, admin, deleteUser);

router.route('/users/:id/reset-password')
    .put(protect, admin, resetUserPassword);

// Analytics
router.get('/analytics', protect, admin, getAnalytics);

export default router;