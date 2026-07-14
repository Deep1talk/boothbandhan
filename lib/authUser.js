import "server-only";

import mongoose from "mongoose";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/authToken";
import { connectDB } from "@/lib/connectDB";
import UserModel from "@/models/userSchema";

const SESSION_USER_FIELDS =
  "name email phone idNo bloodGroup whatsappNumber fullAddress ward panchayat block district vidhansabha role avatar parentId isLocked LockReason isEmailVerified createdAt";

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    idNo: user.idNo || "",
    bloodGroup: user.bloodGroup || "",
    whatsappNumber: user.whatsappNumber || "",
    fullAddress: user.fullAddress || "",
    ward: user.ward || "",
    panchayat: user.panchayat || "",
    block: user.block || "",
    district: user.district || "",
    vidhansabha: user.vidhansabha || "",
    avatar: user.avatar,
    role: user.role,
    parentId: user.parentId?.toString() ?? null,
    isEmailVerified: Boolean(user.isEmailVerified),
    isLocked: Boolean(user.isLocked),
    lockReason: user.LockReason?.trim() || "",
    createdAt: user.createdAt || null,
  };
}

export function getLockedUserMessage(user) {
  if (user?.lockReason) {
    return `Your account is locked. ${user.lockReason}`;
  }

  return "Your account is locked. Please contact your administrator.";
}

export async function findSessionUserByToken(token) {
  const session = await verifyAuthToken(token);

  if (!session?.userId || !mongoose.isValidObjectId(session.userId)) {
    return { session: null, user: null };
  }

  await connectDB();

  const user = await UserModel.findById(session.userId).select(SESSION_USER_FIELDS).lean();

  return {
    session,
    user: normalizeUser(user),
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return findSessionUserByToken(token);
}

export async function getRequestUser(req) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return findSessionUserByToken(token);
}
