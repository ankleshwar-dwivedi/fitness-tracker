// backend/src/features/userStatus/userStatus.routes.js
import express from 'express';
const router = express.Router();
import {
  // Assuming these controller functions exist and are correctly named/exported
  // from './userStatus.controller.js' based on your original structure:
  // createUserStatus, getUserStatus, updateUserStatus
  //
  // For the new structure aiming for UPSERT and a single GET:
  getUserDietStatus,
  upsertUserDietStatus,
} from './userStatus.controller.js'; // Ensure this path is correct
import { protect } from '../../middleware/auth.middleware.js'; // Ensure this path is correct

// Routes will be relative to '/api/profile/status' as defined in app.js

// GET current user's diet status
// If no status, controller might return 404 or a default object
router.get('/', protect, getUserDietStatus);

// PUT to create or update the current user's diet status (UPSERT)
router.put('/', protect, upsertUserDietStatus);

// If you still need a separate POST for creation (though PUT for upsert is common):
// router.post('/', protect, createUserDietStatus); // Would need a createUserDietStatus controller

export default router;