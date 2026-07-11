import { connectDB } from "@/lib/connectDB";
import { destroyCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/authUser";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { normalizePosterProfile } from "@/lib/posters";
import { zodLeaderGreetingProfileSchema } from "@/lib/zodSchema";
import UserModel from "@/models/userSchema";

export const dynamic = "force-dynamic";

function getStringValue(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user || user.role !== "Leader") {
      return errorResponse(403, "Only leaders can access greeting profile data.");
    }

    await connectDB();

    const leader = await UserModel.findById(session.userId).lean();

    if (!leader) {
      return errorResponse(404, "Leader not found.");
    }

    return successResponse(200, "Greeting profile fetched successfully", {
      profile: normalizePosterProfile(leader),
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function PUT(req) {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user || user.role !== "Leader") {
      return errorResponse(403, "Only leaders can update greeting profile data.");
    }

    await connectDB();

    const formData = await req.formData();
    const posterPhoto = formData.get("posterPhoto");

    const parsed = zodLeaderGreetingProfileSchema.safeParse({
      name: getStringValue(formData, "name"),
      greetingTagline: getStringValue(formData, "greetingTagline"),
      phone: getStringValue(formData, "phone"),
      whatsappNumber: getStringValue(formData, "whatsappNumber"),
      instagramHandle: getStringValue(formData, "instagramHandle"),
      twitterHandle: getStringValue(formData, "twitterHandle"),
      facebookHandle: getStringValue(formData, "facebookHandle"),
      posterPhotoScale: getStringValue(formData, "posterPhotoScale") || 1,
      posterPhotoOffsetX: getStringValue(formData, "posterPhotoOffsetX") || 0,
      posterPhotoOffsetY: getStringValue(formData, "posterPhotoOffsetY") || 0,
    });

    if (!parsed.success) {
      return errorResponse(400, "Invalid greeting profile data", parsed.error.issues);
    }

    const leader = await UserModel.findById(session.userId);

    if (!leader) {
      return errorResponse(404, "Leader not found.");
    }

    Object.assign(leader, parsed.data);

    if (posterPhoto instanceof File && posterPhoto.size > 0) {
      if (!posterPhoto.type.startsWith("image/")) {
        return errorResponse(400, "Poster photo must be an image.");
      }

      if (posterPhoto.size > 2 * 1024 * 1024) {
        return errorResponse(400, "Poster photo must be 2MB or smaller after optimization.");
      }

      const uploadResult = await uploadImageToCloudinary(posterPhoto, {
        publicId: leader.posterPhotoPublicId || `leader-poster-${leader._id.toString()}`,
        folder: "boothbandhan/poster-photos",
        overwrite: true,
      });

      leader.posterPhoto = uploadResult.url;
      leader.posterPhotoPublicId = uploadResult.publicId;
    }

    await leader.save();

    return successResponse(200, "Greeting profile updated successfully", {
      profile: normalizePosterProfile(leader),
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE() {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user || user.role !== "Leader") {
      return errorResponse(403, "Only leaders can remove greeting photos.");
    }

    await connectDB();

    const leader = await UserModel.findById(session.userId);

    if (!leader) {
      return errorResponse(404, "Leader not found.");
    }

    if (leader.posterPhotoPublicId) {
      await destroyCloudinaryImage(leader.posterPhotoPublicId);
    }

    leader.posterPhoto = "";
    leader.posterPhotoPublicId = null;
    await leader.save();

    return successResponse(200, "Greeting photo removed successfully", {
      profile: normalizePosterProfile(leader),
    });
  } catch (error) {
    return catchError(error);
  }
}
