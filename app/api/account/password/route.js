import { connectDB } from "@/lib/connectDB";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { getCurrentUser } from "@/lib/authUser";
import { zodLoggedInPasswordUpdateSchema } from "@/lib/zodSchema";
import UserModel from "@/models/userSchema";

export const dynamic = "force-dynamic";

export async function PUT(req) {
  try {
    const { session } = await getCurrentUser();

    if (!session?.userId) {
      return errorResponse(401, "Unauthorized");
    }

    await connectDB();
    const data = await req.json();

    const validateData = zodLoggedInPasswordUpdateSchema.safeParse(data);
    if (!validateData.success) {
      return errorResponse(400, "Invalid data", validateData.error.issues);
    }

    const { currentPassword, newPassword } = validateData.data;
    const user = await UserModel.findById(session.userId).select("+password");

    if (!user) {
      return errorResponse(404, "User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return successResponse(200, "Password updated successfully");
  } catch (error) {
    return catchError(error);
  }
}
