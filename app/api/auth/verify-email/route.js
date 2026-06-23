import { connectDB } from "@/lib/connectDB";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import UserModel from "@/models/userSchema";
import { jwtVerify } from "jose";

export async function POST(req) {
  try {
    await connectDB();
    const { token } = await req.json();

    if (!token) {
      return errorResponse(400, "Token is missing");
    }

    const secret = new TextEncoder().encode(process.env.SECRET_KEY);
    const decoded = await jwtVerify(token, secret);

    const rawUserId = decoded.payload.userId || decoded.payload.user;
    const userId =
      typeof rawUserId === "string"
        ? rawUserId
        : rawUserId?.buffer
          ? Buffer.from(Object.values(rawUserId.buffer)).toString("hex")
          : null; // find user id from raw user id send by verification email

    if (!userId) {
      return errorResponse(400, "Invalid verification token");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return errorResponse(404, "User not found");
    }

    if (user.isEmailVerified) {
      return successResponse(200, "Email already verified");
    }

    user.isEmailVerified = true; //change email status
    await user.save();

    return successResponse(200, "Email verified successfully");
  } catch (err) {
    if (err?.code === "ERR_JWT_EXPIRED") {
      return errorResponse(400, "Verification link has expired");
    }

    if (err?.code === "ERR_JWS_INVALID" || err?.code === "ERR_JWT_INVALID") {
      return errorResponse(400, "Invalid verification token");
    }

    return catchError(err);
  }
}
