// backend/src/features/waterIntake/waterIntake.routes.js
import express from 'express';
const router = express.Router();
import {
  // Assuming these controller functions exist and are correctly named/exported
  // from './waterIntake.controller.js' based on your original structure:
  // logWaterIntake, updateWaterIntake, getUserWaterIntake
  //
  // For the new structure aiming for GET and UPSERT by date:
  getWaterIntakeForDate,
  upsertWaterIntakeForDate,
} from './waterIntake.controller.js'; // Ensure this path is correct
import { protect } from '../../middleware/auth.middleware.js'; // Ensure this path is correct

// Routes will be relative to '/api/profile/water-intake' as defined in app.js

// GET user's water intake for a specific date
// Example: /api/profile/water-intake/2023-10-27
router.get('/:date', protect, getWaterIntakeForDate);

// PUT to create or update user's water intake for a specific date (UPSERT)
// This will set the total litersDrank for the given date.
// Example: /api/profile/water-intake/2023-10-27
router.put('/:date', protect, upsertWaterIntakeForDate);

// If you still need the original POST to increment today's water intake:
// This would likely be a POST to a route without a date, e.g., POST /api/profile/water-intake/log
// and the controller would handle getting today's date.
// router.post('/log', protect, logTodaysWaterIncrement); // Would need controller

export default router;