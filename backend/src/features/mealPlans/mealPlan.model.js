    import mongoose from "mongoose";

    const userMealPlanSchema = new mongoose.Schema({
      userId: { // Renamed from user to userId for clarity, matching controller
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      meal1: { type: String, default: "" },
      meal2: { type: String, default: "" },
      meal3: { type: String, default: "" },
      meal4: { type: String, default: "" },
      meal5: { type: String, default: "" },
      snacks: { type: String, default: "" },
    }, { timestamps: true }); // Added timestamps

    // Ensure a user can only have one meal plan per day
    userMealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

    const MealPlan = mongoose.model("MealPlan", userMealPlanSchema);

    export default MealPlan;