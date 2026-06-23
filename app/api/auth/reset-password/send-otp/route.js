import { connectDB } from "@/lib/connectDB";
import { otpEmail } from "@/email/otpEmail";
import { catchError, errorResponse, genrateOtp, successResponse } from "@/lib/helper";
import { sendMail } from "@/lib/sendMail";
import { zodSendOtpSchema } from "@/lib/zodSchema";
import OtpModel from "@/models/otpSchema";
import UserModel from "@/models/userSchema";

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        const validateData = zodSendOtpSchema.safeParse(data);
        if (!validateData.success) {
            return errorResponse(400, "Invalid data", validateData.error.issues);
        }
        const { email } = validateData.data;
        const normalizedEmail = email.trim().toLowerCase();

        // email verification
        const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            return errorResponse(404, "User not found");
        }

        // delete old otps
        await OtpModel.deleteMany({ email: normalizedEmail });

        const otp = genrateOtp();

        const newOtpData = new OtpModel({ email: normalizedEmail, otp });
        await newOtpData.save();

        const emailBody = otpEmail({
            data: {
                name: user.name,
                otp,
            },
        });

        const otpEmailStatus = await sendMail(normalizedEmail, "Password reset OTP", emailBody);
        if (!otpEmailStatus.success) {
            return errorResponse(400, "Failed to send OTP");
        }

        return successResponse(200, "OTP sent successfully. Please check your email.");

    } catch (err) {
        return catchError(err);
    }
}
