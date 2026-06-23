import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
        trim: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
    }
}, {
    timestamps: true
})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically delete expired OTPs

const OtpModel = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export default OtpModel;
