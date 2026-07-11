import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import {
  CLOUDINARY_TEMPLATE_FOLDER,
  destroyCloudinaryImage,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/authUser";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { normalizeFestivalTemplate, toScheduleEnd, toScheduleStart } from "@/lib/posters";
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

export async function PATCH(req, { params }) {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user || user.role !== "Admin") {
      return errorResponse(403, "Only admins can update greeting templates.");
    }

    const { templateId } = await params;

    if (!mongoose.isValidObjectId(templateId)) {
      return errorResponse(400, "Invalid template id.");
    }

    await connectDB();

    const template = await FestivalTemplateModel.findById(templateId);

    if (!template) {
      return errorResponse(404, "Greeting template not found.");
    }

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

    template.title = parsed.data.title;
    template.cardBackgroundColor = parsed.data.cardBackgroundColor;
    template.contactStripBackgroundColor = parsed.data.contactStripBackgroundColor;
    template.nameTextColor = parsed.data.nameTextColor;
    template.taglineTextColor = parsed.data.taglineTextColor;
    template.contactTextColor = parsed.data.contactTextColor;
    template.fontFamily = parsed.data.fontFamily;
    template.isActive = parsed.data.isActive;
    template.startDate = toScheduleStart(parsed.data.startDate);
    template.endDate = toScheduleEnd(parsed.data.endDate);

    if (backgroundImage instanceof File && backgroundImage.size > 0) {
      if (!backgroundImage.type.startsWith("image/")) {
        return errorResponse(400, "Background file must be an image.");
      }

      const uploadResult = await uploadImageToCloudinary(backgroundImage, {
        publicId: template.slug,
        folder: CLOUDINARY_TEMPLATE_FOLDER,
        overwrite: true,
      });

      template.backgroundImage = uploadResult.url;
      template.backgroundImagePublicId = uploadResult.publicId;
    }

    await template.save();

    return successResponse(200, "Greeting template updated successfully", {
      template: normalizeFestivalTemplate(template),
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { session, user } = await getCurrentUser();

    if (!session?.userId || !user || user.role !== "Admin") {
      return errorResponse(403, "Only admins can delete greeting templates.");
    }

    const { templateId } = await params;

    if (!mongoose.isValidObjectId(templateId)) {
      return errorResponse(400, "Invalid template id.");
    }

    await connectDB();

    const template = await FestivalTemplateModel.findById(templateId);

    if (!template) {
      return errorResponse(404, "Greeting template not found.");
    }

    if (template.backgroundImagePublicId) {
      await destroyCloudinaryImage(template.backgroundImagePublicId);
    }

    await template.deleteOne();

    return successResponse(200, "Greeting template deleted successfully");
  } catch (error) {
    return catchError(error);
  }
}
