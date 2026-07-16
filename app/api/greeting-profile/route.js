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

function getNumericValue(rawValue, fallback) {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validateImageState({ posterPhotoScale, posterPhotoOffsetX, posterPhotoOffsetY }) {
  if (!Number.isFinite(Number(posterPhotoScale)) || Number(posterPhotoScale) < 0.2 || Number(posterPhotoScale) > 2.5) {
    return "Photo zoom must stay between 0.2 and 2.5.";
  }

  if (!Number.isFinite(Number(posterPhotoOffsetX)) || Number(posterPhotoOffsetX) < -220 || Number(posterPhotoOffsetX) > 220) {
    return "Horizontal crop offset must stay between -220 and 220.";
  }

  if (!Number.isFinite(Number(posterPhotoOffsetY)) || Number(posterPhotoOffsetY) < -220 || Number(posterPhotoOffsetY) > 360) {
    return "Vertical crop offset must stay between -220 and 360.";
  }

  return "";
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
    const persistImageStateOnly =
      getStringValue(formData, "persistImageStateOnly") === "true";
    const selectedGreetingTemplateId = getStringValue(
      formData,
      "selectedGreetingTemplateId"
    );
    const leader = await UserModel.findById(session.userId);

    if (!leader) {
      return errorResponse(404, "Leader not found.");
    }

    const imageStatePayload = {
      posterPhotoScale:
        getStringValue(formData, "posterPhotoScale") || leader.posterPhotoScale || 1,
      posterPhotoOffsetX:
        getStringValue(formData, "posterPhotoOffsetX") || leader.posterPhotoOffsetX || 0,
      posterPhotoOffsetY:
        getStringValue(formData, "posterPhotoOffsetY") || leader.posterPhotoOffsetY || 0,
    };

    let parsedData = imageStatePayload;

    if (persistImageStateOnly) {
      const imageStateError = validateImageState(imageStatePayload);

      if (imageStateError) {
        return errorResponse(400, imageStateError);
      }
    } else {
      const parsed = zodLeaderGreetingProfileSchema.safeParse({
        name:
          getStringValue(formData, "name") ||
          leader.name ||
          user.name ||
          "",
        greetingTagline:
          getStringValue(formData, "greetingTagline") ||
          leader.greetingTagline ||
          "",
        phone:
          getStringValue(formData, "phone") ||
          leader.phone ||
          user.phone ||
          "",
        whatsappNumber:
          getStringValue(formData, "whatsappNumber") ||
          leader.whatsappNumber ||
          leader.phone ||
          user.phone ||
          "",
        instagramHandle:
          getStringValue(formData, "instagramHandle") ||
          leader.instagramHandle ||
          "",
        twitterHandle:
          getStringValue(formData, "twitterHandle") ||
          leader.twitterHandle ||
          "",
        facebookHandle:
          getStringValue(formData, "facebookHandle") ||
          leader.facebookHandle ||
          "",
        ...imageStatePayload,
      });

      if (!parsed.success) {
        return errorResponse(
          400,
          parsed.error.issues?.[0]?.message || "Invalid greeting profile data",
          parsed.error.issues
        );
      }

      parsedData = parsed.data;
    }

    Object.assign(leader, parsedData);

    if (selectedGreetingTemplateId) {
      leader.selectedGreetingTemplateId = selectedGreetingTemplateId;

      const posterTemplateSettings =
        leader.posterTemplateSettings instanceof Map
          ? leader.posterTemplateSettings
          : new Map(
              Object.entries(leader.posterTemplateSettings || {})
            );

      posterTemplateSettings.set(selectedGreetingTemplateId, {
        posterPhotoScale: getNumericValue(
          parsedData.posterPhotoScale,
          leader.posterPhotoScale || 1
        ),
        posterPhotoOffsetX: getNumericValue(
          parsedData.posterPhotoOffsetX,
          leader.posterPhotoOffsetX || 0
        ),
        posterPhotoOffsetY: getNumericValue(
          parsedData.posterPhotoOffsetY,
          leader.posterPhotoOffsetY || 0
        ),
      });
      leader.posterTemplateSettings = posterTemplateSettings;
    }

    if (posterPhoto instanceof File && posterPhoto.size > 0) {
      if (!posterPhoto.type.startsWith("image/")) {
        return errorResponse(400, "Poster photo must be an image.");
      }

      if (posterPhoto.size > 2 * 1024 * 1024) {
        return errorResponse(400, "Poster photo must be 2MB or smaller after optimization.");
      }

      const uploadResult = await uploadImageToCloudinary(posterPhoto, {
        format: posterPhoto.type === "image/png" ? "png" : undefined,
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
      persistImageStateOnly,
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
