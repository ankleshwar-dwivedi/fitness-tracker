import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  googleLogin, 
  googleLoginCallback 
} from "./auth.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser); // Technically logout should be protected too
router.get("/google", googleLogin); // Route to initiate Google OAuth
router.get("/google/callback", googleLoginCallback); // Google redirect URI

export default router;