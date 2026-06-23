import { connectDB } from "@/lib/connectDB";
import { destroyCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { getCurrentUser } from "@/lib/authUser";
import { zodProfileSchema } from "@/lib/zodSchema";
import UserModel from "@/models/userSchema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user) {
      return errorResponse(401, "Unauthorized");
    }

    return successResponse(200, "Profile fetched successfully", { user });
  } catch (error) {
    return catchError(error);
  }
}

export async function PUT(req) {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user) {
      return errorResponse(401, "Unauthorized");
    }

    await connectDB();

    const formData = await req.formData();
    const name = formData.get("name");
    const avatarFile = formData.get("avatar");

    const parsed = zodProfileSchema.safeParse({
      name: typeof name === "string" ? name.trim() : "",
    });

    if (!parsed.success) {
      return errorResponse(400, "Invalid data", parsed.error.issues);
    }

    const existingUser = await UserModel.findById(session.userId);

    if (!existingUser) {
      return errorResponse(404, "User not found");
    }

    existingUser.name = parsed.data.name;

    if (avatarFile instanceof File && avatarFile.size > 0) {
      if (!avatarFile.type.startsWith("image/")) {
        return errorResponse(400, "Profile picture must be an image.");
      }

      if (avatarFile.size > 5 * 1024 * 1024) {
        return errorResponse(400, "Profile picture must be 5MB or smaller.");
      }

      const uploadResult = await uploadImageToCloudinary(avatarFile, {
        publicId: existingUser.avatarPublicId || `user-${existingUser._id.toString()}`,
        overwrite: true,
      });

      existingUser.avatar = uploadResult.url;
      existingUser.avatarPublicId = uploadResult.publicId;
    }

    await existingUser.save();

    return successResponse(200, "Profile updated successfully", {
      user: {
        id: existingUser._id.toString(),
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        avatar: existingUser.avatar,
        parentId: existingUser.parentId?.toString() ?? null,
        isEmailVerified: Boolean(existingUser.isEmailVerified),
        isLocked: Boolean(existingUser.isLocked),
        lockReason: existingUser.LockReason?.trim() || "",
      },
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE() {
  try {
    const { session } = await getCurrentUser();

    if (!session?.userId) {
      return errorResponse(401, "Unauthorized");
    }

    await connectDB();

    const user = await UserModel.findById(session.userId);

    if (!user) {
      return errorResponse(404, "User not found");
    }

    if (user.avatarPublicId) {
      await destroyCloudinaryImage(user.avatarPublicId);
    }

    user.avatar = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
    user.avatarPublicId = null;
    await user.save();

    return successResponse(200, "Profile picture removed successfully", {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        parentId: user.parentId?.toString() ?? null,
        isEmailVerified: Boolean(user.isEmailVerified),
        isLocked: Boolean(user.isLocked),
        lockReason: user.LockReason?.trim() || "",
      },
    });
  } catch (error) {
    return catchError(error);
  }
}
