import "server-only";

import crypto from "node:crypto";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "boothbandhan/profiles";
export const CLOUDINARY_TEMPLATE_FOLDER =
  process.env.CLOUDINARY_TEMPLATE_FOLDER || "boothbandhan/festival-templates";

function assertCloudinaryConfig() {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }
}

function createSignature(params) {
  const sortedEntries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  const signatureBase = sortedEntries
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${signatureBase}${CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

function normalizePublicId(publicId, folder = CLOUDINARY_FOLDER) {
  if (!publicId) {
    return undefined;
  }

  if (!folder) {
    return publicId;
  }

  if (publicId.startsWith(`${folder}/`)) {
    return publicId;
  }

  return `${folder}/${publicId}`;
}

export async function uploadImageToCloudinary(file, options = {}) {
  assertCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const normalizedPublicId = normalizePublicId(
    options.publicId,
    options.folder ?? CLOUDINARY_FOLDER
  );
  const params = {
    format: options.format,
    public_id: normalizedPublicId,
    overwrite: options.overwrite ? "true" : undefined,
    invalidate: options.overwrite ? "true" : undefined,
    timestamp,
  };

  const signature = createSignature(params);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));

  if (normalizedPublicId) {
    formData.append("public_id", normalizedPublicId);
  }

  if (options.format) {
    formData.append("format", options.format);
  }

  if (options.overwrite) {
    formData.append("overwrite", "true");
    formData.append("invalidate", "true");
  }

  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Image upload failed.");
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
  };
}

export async function destroyCloudinaryImage(publicId) {
  if (!publicId) {
    return;
  }

  assertCloudinaryConfig();

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const signature = createSignature(params);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: CLOUDINARY_API_KEY,
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Image delete failed.");
  }

  return payload;
}
