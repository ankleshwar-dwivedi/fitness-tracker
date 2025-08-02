// /backend/src/features/workouts/workoutLog.model.js
import mongoose from "mongoose";

const workoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date, // Normalized to YYYY-MM-DD 00:00:00 UTC
    required: true,
  },
  // An array of exercises logged for that day
  exercises: [{
    name: { type: String, required: true },
    type: { type: String }, // e.g., 'cardio', 'strength'
    duration_min: { type: Number, required: true },
    calories_burned: { type: Number, required: true, default: 0 },
    notes: { type: String, default: "" },
  }],
  totalCaloriesBurned: { type: Number, default: 0 }
}, { timestamps: true });

// Ensure only one log document per user per day
workoutLogSchema.index({ userId: 1, date: 1 }, { unique: true });

// Pre-save hook to calculate total calories burned for the day
workoutLogSchema.pre('save', function(next) {
  if (this.exercises && this.exercises.length > 0) {
    this.totalCaloriesBurned = this.exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);
  } else {
    this.totalCaloriesBurned = 0;
  }
  next();
});

const WorkoutLog = mongoose.model("WorkoutLog", workoutLogSchema);

export default WorkoutLog;