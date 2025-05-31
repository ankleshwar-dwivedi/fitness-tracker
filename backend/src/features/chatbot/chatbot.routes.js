// /backend/src/features/chatbot/chatbot.routes.js
import express from "express";
import { processChatbotMessage } from "./chatbot.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/message", protect, processChatbotMessage);

export default router;