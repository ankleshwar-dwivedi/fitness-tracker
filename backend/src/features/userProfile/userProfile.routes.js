import express from "express";
const router = express.Router();
import {
  getUserProfileDetails,
  updateUserProfileDetails,
  getUserDietStatus,
  upsertUserDietStatus,
  getWaterIntakeForDate,
  upsertWaterIntakeForDate,
} from "./userProfile.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

// User basic profile (name, email, password)
router
  .route("/") // Corresponds to /api/users/profile
  .get(protect, getUserProfileDetails)
  .put(protect, updateUserProfileDetails);

// User diet status
router
  .route("/status") // Corresponds to /api/users/profile/status
  .get(protect, getUserDietStatus)
  .put(protect, upsertUserDietStatus);

// User water intake
router
  .route("/water-intake/:date") // Corresponds to /api/users/profile/water-intake/YYYY-MM-DD
  .get(protect, getWaterIntakeForDate)
  .put(protect, upsertWaterIntakeForDate);


export default router;