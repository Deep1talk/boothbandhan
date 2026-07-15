import { connectDB } from "@/lib/connectDB";
import { getCurrentUser } from "@/lib/authUser";
import { sendVerificationEmailToUser } from "@/lib/emailVerification";
import { errorResponse, successResponse } from "@/lib/helper";
import UserModel from "@/models/userSchema";

export async function POST(req) {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user) {
      return errorResponse(401, "Unauthorized");
    }

    await connectDB();

    const targetUser = await UserModel.findById(session.userId).select(
      "_id name email role isEmailVerified"
    );

    if (!targetUser) {
      return errorResponse(404, "User not found");
    }

    if (targetUser.isEmailVerified) {
      return errorResponse(400, "Email is already verified");
    }

    if (!targetUser.email?.trim()) {
      return errorResponse(400, "User does not have a valid email address");
    }

    const verificationBaseUrl = new URL(req.url).origin;
    const mailResult = await sendVerificationEmailToUser(targetUser, {
      baseUrl: verificationBaseUrl,
    });

    if (!mailResult.success) {
      const mailErrorMessage =
        mailResult.error?.response ||
        mailResult.error?.message ||
        mailResult.message ||
        "Unable to send verification email";

      return errorResponse(500, mailErrorMessage);
    }

    return successResponse(
      200,
      `Verification email sent to ${targetUser.email}`,
      {
        user: {
          id: targetUser._id.toString(),
          email: targetUser.email,
          role: targetUser.role,
        },
      }
    );
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
