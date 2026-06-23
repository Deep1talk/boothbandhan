import { connectDB } from "@/lib/connectDB";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { zodVerifyOtpWithEmailSchema } from "@/lib/zodSchema";
import OtpModel from "@/models/otpSchema";
import UserModel from "@/models/userSchema";

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();
        const validateData = zodVerifyOtpWithEmailSchema.safeParse(data);

        if (!validateData.success) {
            return errorResponse(400, "Invalid data", validateData.error.issues);
        }
        const { email, otp } = validateData.data;
        const normalizedEmail = email.trim().toLowerCase();

        const getOtpData = await OtpModel.findOne({
            email: normalizedEmail,
            otp,
            expiresAt: { $gt: new Date() },
        });

        if (!getOtpData) {
            return errorResponse(400, "Invalid or expired OTP");
        }

        const getUser = await UserModel.findOne({
            email: normalizedEmail,
            deletedAt: null,
        });

        if (!getUser) {
            return errorResponse(404, "User not found");
        }

        await getOtpData.deleteOne();

        return successResponse(200, "OTP verified successfully");
    } catch (err) {
        return catchError(err);
    }
}
