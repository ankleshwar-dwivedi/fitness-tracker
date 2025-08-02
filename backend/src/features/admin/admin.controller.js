
// /backend/src/features/admin/admin.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import User from '../auth/user.model.js';
import MealPlan from '../mealPlans/mealPlan.model.js';
import WorkoutLog from '../workouts/workoutLog.model.js';

// @desc    Get all users (for admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    // Add pagination later for performance
    const users = await User.find({}).select('-password -googleRefreshToken -googleAccessToken');
    res.json(users);
});

// @desc    Delete a user (for admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.isAdmin) {
            res.status(400);
            throw new Error('Cannot delete an admin user.');
        }
        // Also delete associated data
        await MealPlan.deleteMany({ userId: user._id });
        await WorkoutLog.deleteMany({ userId: user._id });
        // ...delete other user-specific data...

        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User and their data removed.' });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Reset a user's password (for admin)
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters long.');
    }

    const user = await User.findById(req.params.id);

    if (user) {
        user.password = newPassword; // The pre-save hook in user.model.js will hash it
        await user.save();
        res.json({ message: 'User password has been reset.' });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Get application analytics (for admin)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalMealPlansLogged = await MealPlan.countDocuments();
    const totalWorkoutsLogged = await WorkoutLog.countDocuments();
    // More advanced analytics can be added here (e.g., using aggregation pipelines)

    res.json({
        totalUsers,
        totalMealPlansLogged,
        totalWorkoutsLogged,
    });
});

export { getAllUsers, deleteUser, resetUserPassword, getAnalytics };