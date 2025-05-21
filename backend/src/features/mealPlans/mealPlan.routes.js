import express from "express";
const router = express.Router();
import {
  getUserMealPlanByDate,
  upsertUserMealPlanByDate,
} from "./mealPlan.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

router
  .route("/:date") // Example: /api/meal-plans/2023-10-26
  .get(protect, getUserMealPlanByDate)
  .put(protect, upsertUserMealPlanByDate);

export default router;