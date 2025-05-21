    import mongoose from "mongoose";

    const userWaterIntakeSchema = new mongoose.Schema({
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      date: { // This should be just the date part, not timestamp, for daily tracking
        type: Date, // Store as YYYY-MM-DD 00:00:00 UTC
        required: true,
      },
      litersDrank: {
        type: Number,
        required: true,
        default: 0
      }
    }, { timestamps: true }); // Added timestamps

    // Ensure a user can only have one water intake record per day
    userWaterIntakeSchema.index({ userId: 1, date: 1 }, { unique: true });


    const UserWaterIntake = mongoose.model('UserWaterIntake', userWaterIntakeSchema);

    export default UserWaterIntake;