import { sendVerificationEmailToUser } from "@/lib/emailVerification";
import UserModel from "@/models/userSchema";

export const CHILD_ROLE_BY_PARENT_ROLE = Object.freeze({
  Admin: "Candidate",
  Candidate: "Leader",
});

export function getChildRoleForParent(parentRole) {
  return CHILD_ROLE_BY_PARENT_ROLE[parentRole] ?? null;
}

export async function createUserWithVerification({
  name,
  email,
  phone,
  password,
  role,
  parentId = null,
  profileData = null,
  userState = null,
  verificationBaseUrl = "",
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  const existingUser = await UserModel.findOne({
    $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
  });

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      return {
        success: false,
        status: 400,
        message: "User already exists with this email",
      };
    }

    return {
      success: false,
      status: 400,
      message: "User already exists with this phone number",
    };
  }

  const user = await UserModel.create({
    role,
    name,
    email: normalizedEmail,
    phone: normalizedPhone,
    password,
    parentId,
    ...(profileData ?? {}),
    ...(userState ?? {}),
  });

  // In long-lived Next.js dev processes, a previously compiled Mongoose model can
  // temporarily lag behind newly added schema fields. Persist critical profile
  // fields directly as a follow-up so recent schema additions are not dropped.
  if (profileData && Object.keys(profileData).length) {
    await UserModel.collection.updateOne(
      { _id: user._id },
      {
        $set: profileData,
      }
    );

    Object.assign(user, profileData);
  }

  const mailResult = await sendVerificationEmailToUser(user, {
    baseUrl: verificationBaseUrl,
  });

  return {
    success: true,
    status: 201,
    message: mailResult.success
      ? `${role} created successfully`
      : `${role} created successfully, but email is not verified`,
    user,
  };
}
