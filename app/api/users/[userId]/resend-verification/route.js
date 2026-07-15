import { connectDB } from "@/lib/connectDB";
import { sendVerificationEmailToUser } from "@/lib/emailVerification";
import { errorResponse, successResponse } from "@/lib/helper";
import { requireRequestUser } from "@/lib/server/requestUser";
import { findAdminManagedUser } from "@/lib/users/queries";
import UserModel from "@/models/userSchema";

async function findResendTarget(actor, userId) {
  if (actor.role === "Admin") {
    const targetUser = await findAdminManagedUser(actor.id, userId);

    if (!targetUser) {
      return null;
    }

    return UserModel.findOne({
      _id: targetUser._id,
      role: { $in: ["Candidate", "Leader"] },
    }).select("_id name email role isEmailVerified");
  }

  if (actor.role === "Candidate") {
    return UserModel.findOne({
      _id: userId,
      role: "Leader",
      parentId: actor.id,
    }).select("_id name email role isEmailVerified");
  }

  return null;
}

export async function POST(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin", "Candidate"]);

    if (!auth.ok) {
      return auth.response;
    }

    await connectDB();
    const verificationBaseUrl = new URL(req.url).origin;

    const { user } = auth;
    const { userId } = await params;
    const targetUser = await findResendTarget(user, userId);

    if (!targetUser) {
      return errorResponse(404, "User not found");
    }

    if (targetUser.isEmailVerified) {
      return errorResponse(400, "Email is already verified");
    }

    if (!targetUser.email?.trim()) {
      return errorResponse(400, "User does not have a valid email address");
    }

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

    return successResponse(200, `Verification email sent to ${targetUser.email}`, {
      user: {
        id: targetUser._id.toString(),
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
