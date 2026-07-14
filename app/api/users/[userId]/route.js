import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import { destroyCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { zodAdminUpdateManagedUserSchema } from "@/lib/zodSchema";
import { requireRequestUser } from "@/lib/server/requestUser";
import HelpDeskProblemModel from "@/models/helpDeskProblemSchema";
import NotificationReadModel from "@/models/notificationReadSchema";
import UserModel from "@/models/userSchema";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { userId } = await params;

    await connectDB();

    const managedUser = await UserModel.findOne({
      _id: userId,
      role: "Candidate",
      parentId: auth.user.id,
    });

    if (!managedUser) {
      return errorResponse(404, "Field associate not found");
    }

    const formData = await req.formData();
    const rawEntries = Object.fromEntries(formData.entries());
    const avatarFile = formData.get("profileImage");
    const parsed = zodAdminUpdateManagedUserSchema.safeParse(rawEntries);

    if (!parsed.success) {
      return errorResponse(400, "Invalid data", parsed.error.issues);
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const normalizedPhone = parsed.data.phone.trim();

    const existingConflict = await UserModel.findOne({
      _id: { $ne: managedUser._id },
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    })
      .select("_id email phone")
      .lean();

    if (existingConflict) {
      if (existingConflict.email === normalizedEmail) {
        return errorResponse(400, "User already exists with this email");
      }

      return errorResponse(400, "User already exists with this phone number");
    }

    const updatePayload = {
      name: parsed.data.name,
      email: normalizedEmail,
      phone: normalizedPhone,
      idNo: parsed.data.idNo,
      bloodGroup: parsed.data.bloodGroup,
      fullAddress: parsed.data.fullAddress,
      block: parsed.data.block,
      district: parsed.data.district,
      vidhansabha: parsed.data.vidhansabha,
    };

    if (avatarFile instanceof File && avatarFile.size > 0) {
      if (!avatarFile.type.startsWith("image/")) {
        return errorResponse(400, "Profile picture must be an image.");
      }

      if (avatarFile.size > 2 * 1024 * 1024) {
        return errorResponse(400, "Profile picture must be 2MB or smaller.");
      }

      const uploadResult = await uploadImageToCloudinary(avatarFile, {
        publicId: managedUser.avatarPublicId || `user-${managedUser._id.toString()}`,
        overwrite: true,
      });

      updatePayload.avatar = uploadResult.url;
      updatePayload.avatarPublicId = uploadResult.publicId;
    }

    await UserModel.collection.updateOne(
      { _id: managedUser._id },
      {
        $set: updatePayload,
      }
    );

    const refreshedUser = await UserModel.findById(managedUser._id)
      .select("name email phone idNo bloodGroup fullAddress block district vidhansabha avatar avatarPublicId")
      .lean();

    if (!refreshedUser) {
      return errorResponse(404, "Field associate not found after update");
    }

    return successResponse(200, "Field associate updated successfully", {
      user: {
        id: refreshedUser._id.toString(),
        name: refreshedUser.name,
        email: refreshedUser.email,
        phone: refreshedUser.phone,
        idNo: refreshedUser.idNo || "",
        bloodGroup: refreshedUser.bloodGroup || "",
        fullAddress: refreshedUser.fullAddress || "",
        block: refreshedUser.block || "",
        district: refreshedUser.district || "",
        vidhansabha: refreshedUser.vidhansabha || "",
        avatar: refreshedUser.avatar,
        avatarPublicId: refreshedUser.avatarPublicId || "",
      },
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { userId } = await params;

    await connectDB();

    if (!mongoose.isValidObjectId(userId)) {
      return errorResponse(404, "User not found");
    }

    const managedUser = await UserModel.findById(userId)
      .select("_id name role parentId avatarPublicId posterPhotoPublicId")
      .lean();

    if (!managedUser) {
      return errorResponse(404, "User not found");
    }

    if (managedUser.role === "Candidate") {
      if (managedUser.parentId?.toString() !== auth.user.id) {
        return errorResponse(404, "Field associate not found");
      }
    } else if (managedUser.role === "Leader") {
      if (managedUser.parentId) {
        const parentCandidate = await UserModel.findOne({
          _id: managedUser.parentId,
          role: "Candidate",
          parentId: auth.user.id,
        })
          .select("_id")
          .lean();

        if (!parentCandidate) {
          return errorResponse(404, "Leader not found");
        }
      }
    } else {
      return errorResponse(403, "This user cannot be deleted.");
    }

    const linkedLeaders =
      managedUser.role === "Candidate"
        ? await UserModel.find({
            role: "Leader",
            parentId: managedUser._id,
          })
            .select("_id")
            .lean()
        : [];

    const usersToDelete = [managedUser];
    const userIds = usersToDelete.map((user) => user._id);
    const leaderIds =
      managedUser.role === "Leader" ? [managedUser._id] : [];
    const cloudinaryPublicIds = Array.from(
      new Set(
        usersToDelete.flatMap((user) =>
          [user.avatarPublicId, user.posterPhotoPublicId].filter(Boolean)
        )
      )
    );

    for (const publicId of cloudinaryPublicIds) {
      await destroyCloudinaryImage(publicId);
    }

    await Promise.all([
      UserModel.deleteMany({ _id: { $in: userIds } }),
      NotificationReadModel.deleteMany({ userId: { $in: userIds } }),
      linkedLeaders.length
        ? UserModel.updateMany(
            { _id: { $in: linkedLeaders.map((leader) => leader._id) } },
            { $set: { parentId: null } }
          )
        : Promise.resolve(),
      leaderIds.length
        ? HelpDeskProblemModel.deleteMany({ leaderId: { $in: leaderIds } })
        : Promise.resolve(),
    ]);

    const linkedLeaderCount = linkedLeaders.length;
    const message =
      managedUser.role === "Candidate"
        ? linkedLeaderCount
          ? `Field associate deleted successfully. ${linkedLeaderCount} linked leader${linkedLeaderCount === 1 ? " is" : "s are"} now direct leader${linkedLeaderCount === 1 ? "" : "s"}.`
          : "Field associate deleted successfully."
        : "Leader deleted successfully.";

    return successResponse(200, message, {
      deletedUsers: userIds.length,
      deletedLeaders: leaderIds.length,
      detachedLeaders: linkedLeaderCount,
    });
  } catch (error) {
    return catchError(error);
  }
}
