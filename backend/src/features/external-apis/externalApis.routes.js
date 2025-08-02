// /backend/src/features/external-apis/externalApis.routes.js
import express from 'express';
import { getFoodNutrition, getCaloriesBurned } from './externalApis.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes to proxy external API calls, hiding our API keys
router.get('/food-nutrition', protect, getFoodNutrition);
router.get('/calories-burned', protect, getCaloriesBurned);

export default router;