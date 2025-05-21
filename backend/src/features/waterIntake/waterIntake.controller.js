// backend/src/features/waterIntake/waterIntake.controller.js (Excerpt)
import asyncHandler from '../../middleware/asyncHandler.js'; // Or your asyncHandler utility
import UserWaterIntake from './userWaterIntake.model.js'; // Model for water intake

// Utility to normalize date to YYYY-MM-DD UTC start of day
const normalizeDateToUTCStart = (dateString) => {
  if (!dateString) return null; // Handle undefined dateString
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null; // Handle invalid date string
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// @desc        Get user's water intake for a specific date
// @route       GET /api/profile/water-intake/:date
// @access      Private
export const getWaterIntakeForDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetDate = normalizeDateToUTCStart(req.params.date);

  if (!targetDate) {
    res.status(400);
    throw new Error("Invalid date format provided.");
  }

  let waterIntake = await UserWaterIntake.findOne({ userId, date: targetDate });

  if (!waterIntake) {
    // If no record, return a default object representing 0 intake for that day
    return res.status(200).json({
      userId,
      date: targetDate,
      litersDrank: 0,
      isNew: true // Flag to indicate it's a default, not from DB
    });
  }
  res.status(200).json(waterIntake);
});

// @desc        Create or Update user's water intake for a specific date (UPSERT total)
// @route       PUT /api/profile/water-intake/:date
// @access      Private
export const upsertWaterIntakeForDate = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetDate = normalizeDateToUTCStart(req.params.date);
  const { litersDrank } = req.body; // This should be the TOTAL liters for the day

  if (!targetDate) {
    res.status(400);
    throw new Error("Invalid date format provided.");
  }
  if (litersDrank === undefined || typeof litersDrank !== 'number' || litersDrank < 0) {
    res.status(400);
    throw new Error("Liters drank must be a non-negative number.");
  }
  
  const updatedWaterIntake = await UserWaterIntake.findOneAndUpdate(
    { userId, date: targetDate },
    { $set: { litersDrank } },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json(updatedWaterIntake); // 200 for simplicity on upsert
});