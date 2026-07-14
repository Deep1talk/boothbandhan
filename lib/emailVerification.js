import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { verificationEmail } from "@/email/verificationEmail";
import { sendMail } from "@/lib/sendMail";
import { connectDB } from "@/lib/connectDB";
import UserModel from "@/models/userSchema";

function getVerificationSecret() {
  return new TextEncoder().encode(process.env.SECRET_KEY);
}

function resolveVerificationBaseUrl() {
  const configuredBaseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return configuredBaseUrl || "http://localhost:3000";
}

function getUserIdFromPayload(payload = {}) {
  const rawUserId = payload.userId || payload.user;

  if (typeof rawUserId === "string") {
    return rawUserId;
  }

  if (rawUserId?.buffer) {
    return Buffer.from(Object.values(rawUserId.buffer)).toString("hex");
  }

  return null;
}

export async function createEmailVerificationToken(userId) {
  return new SignJWT({ userId })
    .setIssuedAt()
    .setExpirationTime("48h")
    .setProtectedHeader({ alg: "HS256" })
    .sign(getVerificationSecret());
}

export async function buildEmailVerificationUrl(userId, options = {}) {
  const token = await createEmailVerificationToken(userId);
  const url = new URL(
    "/auth/verify-email",
    options.baseUrl || resolveVerificationBaseUrl()
  );
  url.searchParams.set("token", token);
  return url.toString();
}

export async function sendVerificationEmailToUser(user, options = {}) {
  const verifyUrl = await buildEmailVerificationUrl(user._id.toString(), options);
  const emailBody = verificationEmail({
    link: {
      name: user.name,
      verifyUrl,
    },
  });

  return sendMail(user.email, "Verification Email", emailBody);
}

export async function verifyEmailTokenAndMarkUser(token) {
  await connectDB();

  if (!token) {
    return {
      ok: false,
      status: 400,
      code: "TOKEN_MISSING",
      message: "Verification token is missing.",
    };
  }

  try {
    const decoded = await jwtVerify(token, getVerificationSecret());
    const userId = getUserIdFromPayload(decoded.payload);

    if (!userId) {
      return {
        ok: false,
        status: 400,
        code: "TOKEN_INVALID",
        message: "Invalid verification token.",
      };
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return {
        ok: false,
        status: 404,
        code: "USER_NOT_FOUND",
        message: "User not found.",
      };
    }

    if (user.isEmailVerified) {
      return {
        ok: true,
        status: 200,
        code: "ALREADY_VERIFIED",
        message: "Email already verified.",
      };
    }

    user.isEmailVerified = true;
    await user.save();

    return {
      ok: true,
      status: 200,
      code: "VERIFIED",
      message: "Email verified successfully.",
    };
  } catch (error) {
    if (error?.code === "ERR_JWT_EXPIRED") {
      return {
        ok: false,
        status: 400,
        code: "TOKEN_EXPIRED",
        message: "Verification link has expired.",
      };
    }

    if (error?.code === "ERR_JWS_INVALID" || error?.code === "ERR_JWT_INVALID") {
      return {
        ok: false,
        status: 400,
        code: "TOKEN_INVALID",
        message: "Invalid verification token.",
      };
    }

    throw error;
  }
}
