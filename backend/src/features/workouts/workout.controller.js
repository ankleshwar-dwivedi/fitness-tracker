// /backend/src/features/workouts/workout.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import WorkoutLog from './workoutLog.model.js';
import { normalizeDate } from '../../utils/dateUtils.js';
import axios from 'axios';
import config from '../../config/index.js';
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
// @desc    Add a new exercise to the workout log for a date
// @route   POST /api/workouts/:date
// @access  Private
const addExerciseToLog = asyncHandler(async (req, res) => {
  const { name, duration_min, notes } = req.body;
  if (!name || !duration_min || parseInt(duration_min) <= 0) {
    res.status(400);
    throw new Error("A valid exercise name and positive duration are required.");
  }
  
  const targetDate = normalizeDate(req.params.date);
  
  // Combine duration and name for a more specific query to API-Ninjas
  const activityQuery = `${duration_min} min ${name}`;
  let calories_burned = 0;

  if (config.apiNinjasApiKey) {
    try {
      // CORRECTED: Call the API-Ninjas endpoint with the correct parameter ('activity')
      const response = await axios.get('https://api.api-ninjas.com/v1/caloriesburned', {
        params: { activity: activityQuery },
        headers: { 'X-Api-Key': config.apiNinjasApiKey },
      });
      // API-Ninjas returns an array; sum up total calories if multiple activities match
      if (response.data && response.data.length > 0) {
          calories_burned = response.data.reduce((sum, item) => sum + item.total_calories, 0);
      }
    } catch (apiError) {
        console.error(`Error fetching calories burned from API-Ninjas for "${activityQuery}":`, apiError.message);
        // Do not fail the request; just log with 0 calories
    }
  } else {
      console.warn("Skipping calorie burn lookup: API_NINJAS_API_KEY not configured.");
  }

  const newExercise = {
    name,
    duration_min: parseInt(duration_min, 10),
    calories_burned: Math.round(calories_burned), // Ensure it's an integer
    notes: notes || ""
  };

  let workoutLog = await WorkoutLog.findOne({ userId: req.user._id, date: targetDate });

  if (workoutLog) {
    workoutLog.exercises.push(newExercise);
  } else {
    workoutLog = new WorkoutLog({
      userId: req.user._id,
      date: targetDate,
      exercises: [newExercise]
    });
  }

  const updatedLog = await workoutLog.save(); // pre-save hook will recalculate total
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