// /backend/src/features/admin/admin.controller.js
import asyncHandler from '../../middleware/asyncHandler.js';
import User from '../auth/user.model.js';
import crypto from 'crypto'; // For generating temporary passwords

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.json(users);
});

// @desc    Get user details by ID (admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserByIdAsAdmin = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user details by ID (admin only - e.g., toggle isAdmin, name, email)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserAsAdmin = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.isAdmin !== undefined) {
            // Prevent admin from de-admining themselves if they are the only admin (optional safety)
            // if (req.user._id.toString() === user._id.toString() && !req.body.isAdmin) {
            //     const adminCount = await User.countDocuments({ isAdmin: true });
            //     if (adminCount <= 1) {
            //         res.status(400);
            //         throw new Error('Cannot remove the last admin account.');
            //     }
            // }
            user.isAdmin = Boolean(req.body.isAdmin);
        }
        // Do NOT allow admin to change password directly here. Use separate reset flow.

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Admin resets a user's password (generates a temporary one)
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
const adminResetUserPassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate a secure temporary password
    const temporaryPassword = crypto.randomBytes(8).toString('hex'); // 16 char hex string
    user.password = temporaryPassword; // The 'pre-save' hook in userModel will hash this
    
    // Optionally: Add a flag to user model like `mustChangePasswordOnNextLogin = true`
    // user.mustChangePasswordOnNextLogin = true;

    await user.save();

    res.json({
        message: `Password for ${user.email} has been reset.`,
        temporaryPassword: temporaryPassword, // Send to admin to communicate to user
        // instructions: "User should change this password immediately upon next login."
    });
});


// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUserAsAdmin = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.isAdmin && req.user._id.toString() === user._id.toString()) {
            res.status(400);
            throw new Error('Admins cannot delete their own account.');
        }
        // Consider what to do with related data (meal plans, status, etc.) - cascading delete or nullify user ID
        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


// @desc    Get basic application statistics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getApplicationStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const usersWithGoogleCal = await User.countDocuments({ isGoogleCalendarAuthorized: true });
    // Add more stats as needed:
    // const totalMealPlans = await MealPlan.countDocuments(); // Assuming MealPlan model is imported
    // const totalWaterLogs = await UserWaterIntake.countDocuments(); // Assuming model imported

    res.json({
        stats: {
            totalUsers,
            adminUsers,
            regularUsers: totalUsers - adminUsers,
            usersWithGoogleCal,
            // totalMealPlans,
            // totalWaterLogs,
        },
    });
});


export {
    getAllUsers,
    getUserByIdAsAdmin,
    updateUserAsAdmin,
    adminResetUserPassword,
    deleteUserAsAdmin,
    getApplicationStats,
};