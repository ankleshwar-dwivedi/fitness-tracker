import asyncHandler from "../../middleware/asyncHandler.js";
import User from "../auth/user.model.js"; // User model for profile
import Status from "../userStatus/userStatus.model.js";
import UserWaterIntake from "../waterIntake/userWaterIntake.model.js";

// --- User Profile (Name, Email, Password) ---
// @desc        Get user profile
// @route       GET /api/users/profile
// @access      Private
const getUserProfileDetails = asyncHandler(async (req, res) => {
  // Use req.user which is already populated by the `protect` middleware
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin, // CRITICAL: Add isAdmin to the profile response
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc        Update user profile (Name, Email, Password)
// @route       PUT /api/users/profile
// @access      Private
const updateUserProfileDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password; // Pre-save hook will hash
    }
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});


// --- User Status (Diet Profile) ---
// @desc      Get or Create user status
// @route     GET /api/users/profile/status
// @access    Private
const getUserDietStatus = asyncHandler(async (req, res) => {
  let status = await Status.findOne({ user: req.user._id });

  if (status) {
    res.status(200).json(status);
  } else {
    // If no status, frontend might prompt to create, or we send a default/empty state
    // For now, let's return 404 or an empty object, client can decide to POST to create
    res.status(404).json({ message: "User diet status not found. Please create one."});
    // Alternatively, create a default one here, but that might not be desired.
  }
});

// @desc      Create or Update user status (UPSERT)
// @route     PUT /api/users/profile/status
// @access    Private
const upsertUserDietStatus = asyncHandler(async (req, res) => {
  const { height, weight, goalWeight, age, gender, activityLevel, goal } = req.body;
  const userId = req.user._id;

  // Basic validation (more can be added with a library like Joi or express-validator)
  if (!height || !weight || !goalWeight || !age || !gender || !activityLevel || !goal) {
    res.status(400);
    throw new Error("All diet status fields are required");
  }

  const statusFields = { user: userId, height, weight, goalWeight, age, gender, activityLevel, goal };

  const status = await Status.findOneAndUpdate(
    { user: userId },
    { $set: statusFields },
    { new: true, upsert: true, runValidators: true }
  );
  
  res.status(status ? 200 : 201).json(status); // 200 if updated, 201 if created by upsert
});


// --- User Water Intake ---

// Utility to normalize date to YYYY-MM-DD UTC start of day
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// @desc        Get user's water intake for a specific date
// @route       GET /api/users/profile/water-intake/:date
// @access      Private
const getWaterIntakeForDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetDate = normalizeDate(req.params.date);

  let waterIntake = await UserWaterIntake.findOne({ userId, date: targetDate });

  if (!waterIntake) {
    // If no record, return 0 or create a new one with 0
     waterIntake = { userId, date: targetDate, litersDrank: 0 }; // Send a default
    // Or:
    // waterIntake = await UserWaterIntake.create({ userId, date: targetDate, litersDrank: 0 });
    // res.status(201).json(waterIntake);
    // return;
  }
  res.status(200).json(waterIntake);
});

// @desc        Log or Update user's water intake for a specific date
// @route       PUT /api/users/profile/water-intake/:date
// @access      Private
const upsertWaterIntakeForDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetDate = normalizeDate(req.params.date);
  const { litersDrank } = req.body; // This should be the TOTAL for the day

  if (litersDrank === undefined || litersDrank < 0) {
    res.status(400);
    throw new Error("Liters drank must be a non-negative number.");
  }
  
  const waterIntake = await UserWaterIntake.findOneAndUpdate(
    { userId, date: targetDate },
    { $set: { litersDrank } }, // Sets the total
    // { $inc: { litersDrank: incrementAmount } } // if you want to increment
    { new: true, upsert: true, runValidators: true }
  );

  res.status(waterIntake ? 200 : 201).json(waterIntake);
});


export {
  getUserProfileDetails,
  updateUserProfileDetails,
  getUserDietStatus,
  upsertUserDietStatus,
  getWaterIntakeForDate,
  upsertWaterIntakeForDate,
};