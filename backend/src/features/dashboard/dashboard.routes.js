// /backend/src/features/dashboard/dashboard.routes.js
import express from 'express';
import { getTodaySummary } from './dashboard.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/today-summary', protect, getTodaySummary);

export default router;