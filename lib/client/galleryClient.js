"use client";

import axios from "axios";

export async function getGalleryImages(options = {}) {
  const { data: response } = await axios.get("/api/gallery-images", {
    params: {
      page: options.page,
      pageSize: options.pageSize,
      limit: options.limit,
    },
  });

  return response.data;
}

export async function uploadGalleryImages(files = []) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const { data: response } = await axios.post("/api/gallery-images", formData);
  return response.data?.images ?? [];
}

export async function removeGalleryImage(imageId) {
  const { data: response } = await axios.delete(`/api/gallery-images/${imageId}`);
  return response.data?.image ?? null;
}
