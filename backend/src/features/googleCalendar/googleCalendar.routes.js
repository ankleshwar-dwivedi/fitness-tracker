// /backend/src/features/googleCalendar/googleCalendar.routes.js
import express from "express";
import {
  authorizeGoogleCalendar,
  googleCalendarOAuth2Callback,
  listAppEvents,
  createAppEvent,
  updateAppEvent,
  getGoogleCalendarAuthStatus
} from "./googleCalendar.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// OAuth Routes
router.get("/authorize", protect, authorizeGoogleCalendar);
router.get("/oauth2callback", googleCalendarOAuth2Callback); // No 'protect' as Google redirects here directly

// Event CRUD and Status Routes
router.get("/status", protect, getGoogleCalendarAuthStatus);
router.get("/events", protect, listAppEvents);
router.post("/events", protect, createAppEvent);
router.put("/events/:eventId", protect, updateAppEvent);
// router.delete("/events/:eventId", protect, deleteAppEvent); // Add if needed

export default router;