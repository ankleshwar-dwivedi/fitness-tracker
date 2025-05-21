import asyncHandler from "../../middleware/asyncHandler.js";
import MealPlan from "./mealPlan.model.js"; // Ensure this path is correct

// Utility to normalize date to YYYY-MM-DD UTC start of day
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// @desc      Get user meal plan for a specific date
// @route     GET /api/meal-plans/:date
// @access    Private
const getUserMealPlanByDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetDate = normalizeDate(req.params.date);

  let mealPlan = await MealPlan.findOne({ userId, date: targetDate });

  if (!mealPlan) {
    // If no meal plan exists, return a default structure or 404
    // Frontend can then decide to show an empty form or prompt creation.
    // Creating one by default on GET might not be desired.
     return res.status(200).json({ // Send a default empty plan for the date
        userId,
        date: targetDate,
        meal1: "", meal2: "", meal3: "", meal4: "", meal5: "", snacks: ""
    });
    // Or:
    // res.status(404);
    // throw new Error("Meal plan not found for this date. Please create one.");
  }
  res.status(200).json(mealPlan);
});

// @desc      Create or Update user meal plan for a specific date (UPSERT)
// @route     PUT /api/meal-plans/:date
// @access    Private
const upsertUserMealPlanByDate = asyncHandler(async (req, res) => {
  const { meal1, meal2, meal3, meal4, meal5, snacks } = req.body;
  const userId = req.user._id;
  const targetDate = normalizeDate(req.params.date); // Date from URL param

  const mealPlanData = {
    userId,
    date: targetDate,
    meal1,
    meal2,
    meal3,
    meal4,
    meal5,
    snacks,
  };

  const mealPlan = await MealPlan.findOneAndUpdate(
    { userId, date: targetDate },
    { $set: mealPlanData },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(mealPlan ? 200 : 201).json(mealPlan);
});

export { getUserMealPlanByDate, upsertUserMealPlanByDate };