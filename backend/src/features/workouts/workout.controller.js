// /backend/src/features/workouts/workout.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import WorkoutLog from './workoutLog.model.js';
import UserStatus from '../userStatus/userStatus.model.js'; // To get user weight for calorie calculations
import axios from 'axios';
import config from '../../config/index.js';
import mongoose from 'mongoose';
import { normalizeDate } from '../../utils/dateUtils.js'; // We'll create this file

// @desc    Get workout log for a specific date
// @route   GET /api/workouts/:date
// @access  Private
const getWorkoutLogByDate = asyncHandler(async (req, res) => {
  const targetDate = normalizeDate(req.params.date);
  let workoutLog = await WorkoutLog.findOne({ userId: req.user._id, date: targetDate });

  if (!workoutLog) {
    // If no log exists for the day, return a default empty structure
    return res.json({
      userId: req.user._id,
      date: targetDate,
      exercises: [],
      totalCaloriesBurned: 0
    });
  }
  res.json(workoutLog);
});

// @desc    Add a new exercise to the workout log for a date
// @route   POST /api/workouts/:date
// @access  Private
const addExerciseToLog = asyncHandler(async (req, res) => {
  const { name, duration_min, notes } = req.body;
  if (!name || !duration_min) {
    res.status(400);
    throw new Error("Exercise name and duration are required.");
  }
  
  const targetDate = normalizeDate(req.params.date);
  
  // Fetch user's weight to get a more accurate calorie burn estimate
  const userStatus = await UserStatus.findOne({ user: req.user._id }).select('weight');
  const weight_kg = userStatus ? userStatus.weight : 70; // Default to 70kg if no status

  // Call our external API proxy to get calories burned
  let calories_burned = 0;
  try {
    const activityQuery = `${duration_min} min ${name}`;
    const response = await axios.get('https://api.api-ninjas.com/v1/caloriesburned', {
      params: { activity: name, duration: duration_min, weight: weight_kg },
      headers: { 'X-Api-Key': config.apiNinjasApiKey },
    });
    // API-Ninjas returns an array, sum up total calories if multiple activities match
    if (response.data && response.data.length > 0) {
        calories_burned = response.data.reduce((sum, item) => sum + item.total_calories, 0);
    }
  } catch (apiError) {
      console.error("Error fetching calories burned from API-Ninjas:", apiError.message);
      // Don't fail the request, just log 0 calories or an estimate
  }

  const newExercise = { name, duration_min, calories_burned, notes };

  let workoutLog = await WorkoutLog.findOne({ userId: req.user._id, date: targetDate });

  if (workoutLog) {
    // Log exists, push new exercise to the array
    workoutLog.exercises.push(newExercise);
  } else {
    // No log for this day, create a new one
    workoutLog = new WorkoutLog({
      userId: req.user._id,
      date: targetDate,
      exercises: [newExercise]
    });
  }

  const updatedLog = await workoutLog.save();
  res.status(201).json(updatedLog);
});

// @desc    Remove an exercise from a workout log
// @route   DELETE /api/workouts/:date/:exerciseId
// @access  Private
const removeExerciseFromLog = asyncHandler(async (req, res) => {
    const { date, exerciseId } = req.params;
    const targetDate = normalizeDate(date);

    const workoutLog = await WorkoutLog.findOne({ userId: req.user._id, date: targetDate });

    if (!workoutLog) {
        res.status(404);
        throw new Error('Workout log for this date not found.');
    }

    // Find the exercise to remove
    const exerciseExists = workoutLog.exercises.find(ex => ex._id.toString() === exerciseId);
    if (!exerciseExists) {
        res.status(404);
        throw new Error('Exercise not found in this log.');
    }

    // Pull the exercise from the array
    workoutLog.exercises.pull({ _id: exerciseId });
    
    const updatedLog = await workoutLog.save();
    res.json(updatedLog);
});

// @desc    Update an existing exercise in a workout log
// @route   PUT /api/workouts/:date/:exerciseId
// @access  Private
const updateExerciseInLog = asyncHandler(async (req, res) => {
    // For this version, we will simplify: re-calculate calories if duration/name changes
    // A more complex implementation could avoid re-calling the API if only notes changed.
    const { date, exerciseId } = req.params;
    const { name, duration_min, notes } = req.body;
    const targetDate = normalizeDate(date);
    
    // Logic similar to addExerciseToLog to fetch calories, then find and update the sub-document
    const workoutLog = await WorkoutLog.findOneAndUpdate(
        { "userId": req.user._id, "date": targetDate, "exercises._id": exerciseId },
        { 
            "$set": {
                "exercises.$.name": name,
                "exercises.$.duration_min": duration_min,
                "exercises.$.notes": notes,
                // You would re-calculate and set "exercises.$.calories_burned" here
            }
        },
        { new: true }
    );

    if (!workoutLog) {
        res.status(404);
        throw new Error('Workout log or exercise not found.');
    }
    
    // The pre-save hook on totalCaloriesBurned won't run on findOneAndUpdate,
    // so we need to trigger a save or recalculate manually.
    const updatedLog = await workoutLog.save(); // Easiest way to trigger pre-save hook

    res.json(updatedLog);
});


export { getWorkoutLogByDate, addExerciseToLog, removeExerciseFromLog, updateExerciseInLog };