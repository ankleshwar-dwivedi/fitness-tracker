// backend/src/features/userStatus/userStatus.controller.js (Excerpt)
import asyncHandler from '../../middleware/asyncHandler.js'; // Or your asyncHandler utility
import Status from './userStatus.model.js'; // Model for user status

// @desc      Get user's diet status
// @route     GET /api/profile/status
// @access    Private
export const getUserDietStatus = asyncHandler(async (req, res) => {
  const status = await Status.findOne({ user: req.user._id });
  if (status) {
    res.status(200).json(status);
  } else {
    // Option 1: Return 404
    // res.status(404).json({ message: "User diet status not found. Please create one." });
    // Option 2: Return a default empty object or a predefined structure
    res.status(200).json({
      message: "No diet status found. You can create one.",
      // Provide default fields if desired by frontend
      height: null, weight: null, goalWeight: null, age: null, gender: null, activityLevel: null, goal: null
    });
  }
});

// @desc      Create or Update user's diet status (UPSERT)
// @route     PUT /api/profile/status
// @access    Private
export const upsertUserDietStatus = asyncHandler(async (req, res) => {
  const { height, weight, goalWeight, age, gender, activityLevel, goal } = req.body;
  const userId = req.user._id;

  if (!height || !weight || !goalWeight || !age || !gender || !activityLevel || !goal) {
    res.status(400);
    throw new Error("All diet status fields are required");
  }

  const statusFields = { user: userId, height, weight, goalWeight, age, gender, activityLevel, goal };

  const updatedStatus = await Status.findOneAndUpdate(
    { user: userId },
    { $set: statusFields },
    { new: true, upsert: true, runValidators: true }
  );
  
  // If upsert results in a new document, Mongoose typically doesn't signify it directly in the result.
  // Status code can be 200 for both update and create via upsert for simplicity,
  // or you can check if 'createdAt' is very recent / matches 'updatedAt' to return 201.
  res.status(200).json(updatedStatus);
});