"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useRemoteData } from "@/hooks/useRemoteData";
import { toastAlert } from "@/lib/toastAlert";
import {
  getGalleryImages,
  removeGalleryImage,
  uploadGalleryImages,
} from "@/lib/client/galleryClient";

const ADMIN_GALLERY_PAGE_SIZE = 12;
const MAX_GALLERY_IMAGE_BYTES = 1024 * 1024;
const MAX_GALLERY_IMAGE_DIMENSION = 2000;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read the selected image."));
    };

    image.src = objectUrl;
  });
}

async function compressGalleryFile(file) {
  if (file.size <= MAX_GALLERY_IMAGE_BYTES) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(
    1,
    MAX_GALLERY_IMAGE_DIMENSION / Math.max(image.width || 1, image.height || 1)
  );
  let width = Math.max(1, Math.round((image.width || 1) * scale));
  let height = Math.max(1, Math.round((image.height || 1) * scale));

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to optimize the selected image.");
  }

  const renderImage = () => {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
  };

  renderImage();

  const mimeType = file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg";
  let quality = mimeType === "image/png" ? undefined : 0.9;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) {
      throw new Error("Unable to optimize the selected image.");
    }

    if (blob.size <= MAX_GALLERY_IMAGE_BYTES) {
      const outputName = file.name.replace(/\.[^.]+$/, "") || "gallery-image";
      const extension = mimeType === "image/png" ? "png" : "jpg";

      return new File([blob], `${outputName}.${extension}`, {
        type: mimeType,
        lastModified: Date.now(),
      });
    }

    if (quality && quality > 0.45) {
      quality -= 0.1;
      continue;
    }

    width = Math.max(1, Math.round(width * 0.85));
    height = Math.max(1, Math.round(height * 0.85));
    renderImage();
  }

  throw new Error("Please choose smaller images. We could not optimize them below 1MB.");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminGallerySection() {
  const [page, setPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const {
    data,
    isLoading,
    isRefreshing,
    refresh,
  } = useRemoteData(
    () =>
      getGalleryImages({
        page,
        pageSize: ADMIN_GALLERY_PAGE_SIZE,
      }),
    {
      initialData: {
        images: [],
        pagination: {
          page: 1,
          pageSize: ADMIN_GALLERY_PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
          itemCount: 0,
          startIndex: 0,
          endIndex: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
      dependencyKey: JSON.stringify({ page }),
      onError: (error) => {
        toastAlert(
          "error",
          error.response?.data?.message || error.message || "Unable to load gallery images."
        );
      },
    }
  );

  const previews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        size: Math.max(1, Math.round(file.size / 1024)),
        previewUrl: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, [previews]);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      setSelectedFiles([]);
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      event.target.value = "";
      toastAlert("error", "Invalid image", "Please choose image files only.");
      return;
    }

    try {
      setIsOptimizing(true);
      const optimizedFiles = await Promise.all(
        imageFiles.map((file) => compressGalleryFile(file))
      );
      setSelectedFiles(optimizedFiles);
      toastAlert(
        "success",
        "Images optimized",
        "Gallery images were optimized automatically and kept under 1MB."
      );
    } catch (error) {
      setSelectedFiles([]);
      event.target.value = "";
      toastAlert(
        "error",
        "Unable to optimize images",
        error.message || "Please choose smaller images."
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFiles.length) {
      toastAlert("error", "No images selected", "Choose one or more images first.");
      return;
    }

    try {
      setIsUploading(true);
      await uploadGalleryImages(selectedFiles);
      toastAlert("success", "Gallery updated", "Images uploaded successfully.");
      clearSelectedFiles();

      if (page !== 1) {
        setPage(1);
      } else {
        await refresh();
      }
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to upload gallery images."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      setRemovingId(imageId);
      await removeGalleryImage(imageId);
      toastAlert("success", "Gallery updated", "Image removed successfully.");

      if ((data?.images?.length || 0) === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        await refresh();
      }
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to remove gallery image."
      );
    } finally {
      setRemovingId("");
    }
  };

  const pagination = data?.pagination;
  const images = data?.images || [];

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-[0_24px_70px_rgba(249,115,22,0.10)] sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              Gallery
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Upload gallery images
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Add Cloudinary-backed gallery images for the home page and full gallery page.
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-orange-200 bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Total images
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {pagination?.totalItems ?? images.length}
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleUpload}>
          <div className="rounded-[1.4rem] border border-orange-200 bg-white/90 p-4">
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.2rem] border border-dashed border-orange-300 bg-orange-50/60 px-4 py-6 text-center transition hover:bg-orange-100/70">
              {isOptimizing ? (
                <LoaderCircle className="size-7 animate-spin text-orange-600" />
              ) : (
                <ImagePlus className="size-7 text-orange-600" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {isOptimizing ? "Optimizing gallery images..." : "Choose gallery images"}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  JPG, PNG, or WebP. Images are optimized automatically and kept under 1MB.
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={isOptimizing || isUploading}
                onChange={handleFileChange}
              />
            </label>
          </div>

          {previews.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {previews.map((item) => (
                <article
                  key={`${item.name}-${item.size}`}
                  className="overflow-hidden rounded-[1.25rem] border border-orange-200 bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image
                      src={item.previewUrl}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
              <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.size} KB</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isUploading || isOptimizing || !selectedFiles.length}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUploading || isOptimizing ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {isOptimizing ? "Optimizing..." : isUploading ? "Uploading..." : "Upload images"}
            </button>
            <button
              type="button"
              onClick={clearSelectedFiles}
              disabled={!selectedFiles.length || isUploading || isOptimizing}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear selection
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-white/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Existing
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Gallery library</h3>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="mt-5 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Loading gallery images...
          </div>
        ) : images.length ? (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-50/80 shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image
                      src={image.imageUrl}
                      alt="Gallery image"
                      fill
                      sizes="(max-width: 1279px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Gallery photo</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Added {formatDate(image.createdDate)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(image.id)}
                      disabled={removingId === image.id}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {removingId === image.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {pagination?.totalPages > 1 ? (
              <div className="flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="size-4" />
                    Prev
                  </button>
                  <div className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    {pagination.page} / {pagination.totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(pagination.totalPages, current + 1)
                      )
                    }
                    disabled={!pagination.hasNextPage}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No gallery images uploaded yet.
          </div>
        )}
      </section>
    </div>
  );
}
