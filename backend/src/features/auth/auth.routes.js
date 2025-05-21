import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "./auth.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser); // Technically logout should be protected too

export default router;