// /backend/src/features/mealPlans/mealPlan.model.js
import mongoose from "mongoose";

// Sub-document schema for a single food item
const foodItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  calories: { type: Number, required: true, default: 0 },
  protein_g: { type: Number, default: 0 },
  carbohydrates_total_g: { type: Number, default: 0 },
  fat_total_g: { type: Number, default: 0 },
  serving_size_g: { type: Number, default: 100 },
}, { _id: false }); // _id: false as it's a sub-document

// Sub-document schema for a meal (like breakfast, lunch)
const mealSchema = new mongoose.Schema({
  items: [foodItemSchema], // Each meal contains a list of food items
  totalCalories: { type: Number, default: 0 },
}, { _id: false });

const userMealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date, // Normalized to YYYY-MM-DD 00:00:00 UTC
    required: true,
  },
  // Replace individual meal strings with structured meal objects
  breakfast: mealSchema,
  lunch: mealSchema,
  dinner: mealSchema,
  snacks: mealSchema,
  totalCalories: { type: Number, default: 0 }, // Total for the day
  // You can add total protein, carbs, fat here as well if needed
}, { timestamps: true });

// Ensure a user can only have one meal plan per day
userMealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save hook to calculate totals before saving
userMealPlanSchema.pre('save', function(next) {
  let dayTotalCalories = 0;
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

  mealTypes.forEach(mealType => {
    if (this[mealType] && this[mealType].items.length > 0) {
      const mealTotal = this[mealType].items.reduce((sum, item) => sum + item.calories, 0);
      this[mealType].totalCalories = mealTotal;
      dayTotalCalories += mealTotal;
    } else if (this[mealType]) {
        this[mealType].totalCalories = 0;
    }
  });

  this.totalCalories = dayTotalCalories;
  next();
});

const MealPlan = mongoose.model("MealPlan", userMealPlanSchema);

export default MealPlan;