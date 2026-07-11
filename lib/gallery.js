import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import { destroyCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import GalleryImageModel from "@/models/galleryImageSchema";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 24;
const CLOUDINARY_GALLERY_FOLDER =
  process.env.CLOUDINARY_GALLERY_FOLDER || "boothbandhan/gallery";

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildPagination(page, pageSize, totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    itemCount: Math.max(0, endIndex - startIndex + 1),
    startIndex,
    endIndex,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

function serializeGalleryImage(image) {
  return {
    id: image._id.toString(),
    imageUrl: image.imageUrl,
    imagePublicId: image.imagePublicId,
    createdDate: image.createdAt,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
  };
}

export async function listGalleryImages(options = {}) {
  await connectDB();

  const requestedPageSize = parsePositiveInt(
    options.limit ?? options.pageSize,
    DEFAULT_PAGE_SIZE
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
  const requestedPage = parsePositiveInt(options.page, 1);
  const totalItems = await GalleryImageModel.countDocuments({});
  const pagination = buildPagination(requestedPage, pageSize, totalItems);
  const skip = Math.max(0, (pagination.page - 1) * pageSize);

  const images = await GalleryImageModel.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    images: images.map(serializeGalleryImage),
    pagination: {
      ...pagination,
      itemCount: images.length,
    },
  };
}

export async function createGalleryImages(adminUserId, files = []) {
  await connectDB();

  const uploads = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const uploadResult = await uploadImageToCloudinary(file, {
      folder: CLOUDINARY_GALLERY_FOLDER,
      publicId: `gallery-${Date.now()}-${index}`,
    });

    uploads.push({
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.publicId,
      createdBy: adminUserId,
    });
  }

  const createdImages = await GalleryImageModel.insertMany(uploads);
  return createdImages.map(serializeGalleryImage);
}

export async function deleteGalleryImage(imageId) {
  await connectDB();

  if (!mongoose.isValidObjectId(imageId)) {
    return null;
  }

  const image = await GalleryImageModel.findByIdAndDelete(imageId).lean();

  if (!image) {
    return null;
  }

  await destroyCloudinaryImage(image.imagePublicId);
  return serializeGalleryImage(image);
}
