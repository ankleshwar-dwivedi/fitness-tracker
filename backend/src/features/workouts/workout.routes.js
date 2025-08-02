// /backend/src/features/workouts/workout.routes.js
import express from 'express';
import { getWorkoutLogByDate, addExerciseToLog, removeExerciseFromLog, updateExerciseInLog } from './workout.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.route('/:date')
  .get(protect, getWorkoutLogByDate)   // Get the full workout log for a specific date
  .post(protect, addExerciseToLog);    // Add a new exercise to the log for that date

router.route('/:date/:exerciseId')
  .delete(protect, removeExerciseFromLog) // Remove a specific exercise from the log
  .put(protect, updateExerciseInLog);     // Update a specific exercise in the log

export default router;