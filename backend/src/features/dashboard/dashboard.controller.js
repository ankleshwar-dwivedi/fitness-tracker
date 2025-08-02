// /backend/src/features/dashboard/dashboard.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import UserStatus from '../userStatus/userStatus.model.js';
import MealPlan from '../mealPlans/mealPlan.model.js';
import WorkoutLog from '../workouts/workoutLog.model.js';
import UserWaterIntake from '../waterIntake/userWaterIntake.model.js';
import { normalizeDate } from '../../utils/dateUtils.js';

// @desc    Get an aggregated summary of the user's data for today
// @route   GET /api/dashboard/today-summary
// @access  Private
const getTodaySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = normalizeDate(new Date());

  // Use Promise.all to fetch all data concurrently for performance
  const [status, mealPlan, workoutLog, waterIntake] = await Promise.all([
    UserStatus.findOne({ user: userId }),
    MealPlan.findOne({ userId, date: today }),
    WorkoutLog.findOne({ userId, date: today }),
    UserWaterIntake.findOne({ userId, date: today }),
  ]);

  // --- Calculate Calorie Goal ---
  // This is a simplified BMR + TDEE calculation (Harris-Benedict equation).
  // For a real app, use a more robust library or formula (e.g., Mifflin-St Jeor).
  let calorieGoal = 2000; // Default goal
  if (status) {
    let bmr = 0;
    if (status.gender.toLowerCase() === 'male') {
      bmr = 88.362 + (13.397 * status.weight) + (4.799 * status.height) - (5.677 * status.age);
    } else { // female
      bmr = 447.593 + (9.247 * status.weight) + (3.098 * status.height) - (4.330 * status.age);
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      active: 1.55,
      veryActive: 1.725,
    };
    const tdee = bmr * (activityMultipliers[status.activityLevel] || 1.2);

    const goalAdjustments = {
        Maintenance: 0,
        Cutting: -500, // Deficit of 500 calories
        Bulking: 500,  // Surplus of 500 calories
    };
    calorieGoal = tdee + (goalAdjustments[status.goal] || 0);
  }

  const caloriesConsumed = mealPlan ? mealPlan.totalCalories : 0;
  const caloriesBurned = workoutLog ? workoutLog.totalCaloriesBurned : 0;
  const caloriesLeft = calorieGoal - caloriesConsumed + caloriesBurned;

  const summary = {
    goals: {
        calorieGoal: Math.round(calorieGoal),
        // Add other goals like protein, water etc.
    },
    today: {
        caloriesConsumed: Math.round(caloriesConsumed),
        caloriesBurned: Math.round(caloriesBurned),
        caloriesLeft: Math.round(caloriesLeft),
        waterIntakeLiters: waterIntake ? waterIntake.litersDrank : 0,
        meals: mealPlan || { breakfast: { items: [], totalCalories: 0 }, lunch: { items: [], totalCalories: 0 }, dinner: { items: [], totalCalories: 0 }, snacks: { items: [], totalCalories: 0 }},
        workouts: workoutLog ? workoutLog.exercises : [],
    },
  };

  res.json(summary);
});

export { getTodaySummary };
