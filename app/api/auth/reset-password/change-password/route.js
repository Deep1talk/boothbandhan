import { connectDB } from "@/lib/connectDB";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { zodChangePasswordSchema } from "@/lib/zodSchema";
import UserModel from "@/models/userSchema";

export async function PUT(req) {
    try {
        await connectDB();
        const data = await req.json();

        const validateData = zodChangePasswordSchema.safeParse(data);
        if (!validateData.success) {
            return errorResponse(400, "Invalid data", validateData.error.issues);
        }
        const { email, password } = validateData.data;
        const normalizedEmail = email.trim().toLowerCase();

        const getUser = await UserModel.findOne({ email: normalizedEmail }).select("+password");
        if (!getUser) {
            return errorResponse(404, "User not found");
        }
        getUser.password = password;
        await getUser.save();

        return successResponse(200, "Password changed successfully");
    } catch (err) {
        return catchError(err);
    }
}
