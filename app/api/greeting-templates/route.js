import { connectDB } from "@/lib/connectDB";
import { getCurrentUser } from "@/lib/authUser";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { CLOUDINARY_TEMPLATE_FOLDER, uploadImageToCloudinary } from "@/lib/cloudinary";
import {
  normalizeFestivalTemplate,
  slugifyFestivalTitle,
  isTemplateLive,
  toScheduleEnd,
  toScheduleStart,
} from "@/lib/posters";
import { zodFestivalTemplateSchema } from "@/lib/zodSchema";
import FestivalTemplateModel from "@/models/festivalTemplateSchema";

export const dynamic = "force-dynamic";

function getStringValue(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBooleanValue(formData, key) {
  return getStringValue(formData, key) === "true";
}

export async function GET() {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user) {
      return errorResponse(401, "Unauthorized");
    }

    await connectDB();

    const templates = await FestivalTemplateModel.find({})
      .sort({ updatedAt: -1 })
      .lean();

    const normalizedTemplates = templates.map(normalizeFestivalTemplate);

    if (user.role === "Admin") {
      return successResponse(200, "Templates fetched successfully", {
        templates: normalizedTemplates,
      });
    }

    return successResponse(200, "Active templates fetched successfully", {
      templates: normalizedTemplates.filter(isTemplateLive),
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(req) {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user || user.role !== "Admin") {
      return errorResponse(403, "Only admins can create greeting templates.");
    }

    await connectDB();

    const formData = await req.formData();
    const backgroundImage = formData.get("backgroundImage");

    const parsed = zodFestivalTemplateSchema.safeParse({
      title: getStringValue(formData, "title"),
      cardBackgroundColor: getStringValue(formData, "cardBackgroundColor"),
      contactStripBackgroundColor: getStringValue(formData, "contactStripBackgroundColor"),
      nameTextColor: getStringValue(formData, "nameTextColor"),
      taglineTextColor: getStringValue(formData, "taglineTextColor"),
      contactTextColor: getStringValue(formData, "contactTextColor"),
      fontFamily: getStringValue(formData, "fontFamily"),
      isActive: getBooleanValue(formData, "isActive"),
      startDate: getStringValue(formData, "startDate"),
      endDate: getStringValue(formData, "endDate"),
    });

    if (!parsed.success) {
      return errorResponse(400, "Invalid template data", parsed.error.issues);
    }

    if (!(backgroundImage instanceof File) || backgroundImage.size === 0) {
      return errorResponse(400, "Please upload a background image.");
    }

    if (!backgroundImage.type.startsWith("image/")) {
      return errorResponse(400, "Background file must be an image.");
    }

    const slugBase = slugifyFestivalTitle(parsed.data.title);
    const slug = `${slugBase || "festival-template"}-${Date.now()}`;
    const uploadResult = await uploadImageToCloudinary(backgroundImage, {
      publicId: slug,
      folder: CLOUDINARY_TEMPLATE_FOLDER,
      overwrite: false,
    });

    const template = await FestivalTemplateModel.create({
      title: parsed.data.title,
      slug,
      backgroundImage: uploadResult.url,
      backgroundImagePublicId: uploadResult.publicId,
      cardBackgroundColor: parsed.data.cardBackgroundColor,
      contactStripBackgroundColor: parsed.data.contactStripBackgroundColor,
      nameTextColor: parsed.data.nameTextColor,
      taglineTextColor: parsed.data.taglineTextColor,
      contactTextColor: parsed.data.contactTextColor,
      fontFamily: parsed.data.fontFamily,
      isActive: parsed.data.isActive,
      startDate: toScheduleStart(parsed.data.startDate),
      endDate: toScheduleEnd(parsed.data.endDate),
    });

    return successResponse(201, "Greeting template created successfully", {
      template: normalizeFestivalTemplate(template),
    });
  } catch (error) {
    return catchError(error);
  }
}
