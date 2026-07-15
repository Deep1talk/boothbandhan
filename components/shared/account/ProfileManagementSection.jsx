"use client";

import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toastAlert } from "@/lib/toastAlert";
import { zodLoggedInPasswordUpdateSchema, zodProfileSchema } from "@/lib/zodSchema";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import FieldAssociateIdCardPanel from "@/components/shared/account/FieldAssociateIdCardPanel";

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
const MAX_AVATAR_BYTES = 1024 * 1024;
const MAX_AVATAR_DIMENSION = 1600;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

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

async function compressAvatarFile(file) {
  if (file.size <= MAX_AVATAR_BYTES) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(
    1,
    MAX_AVATAR_DIMENSION / Math.max(image.width || 1, image.height || 1)
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

    if (blob.size <= MAX_AVATAR_BYTES) {
      const outputName = file.name.replace(/\.[^.]+$/, "") || "profile-photo";
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

  throw new Error("Please choose a smaller image. We could not optimize it below 1MB.");
}

export default function ProfileManagementSection({ user }) {
  const { language } = useLanguage();
  const t = (en, hi) => (language === "hi" ? hi : en);
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOptimizingAvatar, setIsOptimizingAvatar] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user.avatar || DEFAULT_AVATAR);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(user.avatar || DEFAULT_AVATAR);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toastAlert("error", "Invalid image", "Please choose an image file.");
      event.target.value = "";
      return;
    }

    try {
      setIsOptimizingAvatar(true);
      const optimizedFile = await compressAvatarFile(file);

      setSelectedFile(optimizedFile);
      setPreviewUrl(URL.createObjectURL(optimizedFile));
      toastAlert(
        "success",
        "Photo optimized",
        optimizedFile.size > file.size
          ? "Profile photo is ready to upload."
          : "Profile photo was optimized automatically and kept under 1MB."
      );
    } catch (error) {
      setSelectedFile(null);
      setPreviewUrl(user.avatar || DEFAULT_AVATAR);
      event.target.value = "";
      toastAlert(
        "error",
        "Unable to optimize photo",
        error.message || "Please choose a smaller image."
      );
    } finally {
      setIsOptimizingAvatar(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(user.avatar || DEFAULT_AVATAR);
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm({
    resolver: zodResolver(zodProfileSchema),
    defaultValues: {
      name: user.name || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm({
    resolver: zodResolver(zodLoggedInPasswordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitProfile = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const { data: response } = await axios.put("/api/account/profile", formData);

      if (!response.success) {
        throw new Error(response.message);
      }

      toastAlert("success", "Profile updated", response.message);
      clearSelectedFile();
      router.refresh();
    } catch (error) {
      toastAlert(
        "error",
        "Profile update failed",
        error.response?.data?.message || error.message || "Please try again."
      );
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      const { data: response } = await axios.put("/api/account/password", data);

      if (!response.success) {
        throw new Error(response.message);
      }

      toastAlert("success", "Password updated", response.message);
      resetPasswordForm();
    } catch (error) {
      toastAlert(
        "error",
        "Password update failed",
        error.response?.data?.message || error.message || "Please try again."
      );
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsRemovingAvatar(true);
      const { data: response } = await axios.delete("/api/account/profile");

      if (!response.success) {
        throw new Error(response.message);
      }

      toastAlert("success", "Profile picture removed", response.message);
      clearSelectedFile();
      router.refresh();
    } catch (error) {
      toastAlert(
        "error",
        "Unable to remove profile picture",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResendingVerification(true);
      const { data: response } = await axios.post("/api/account/resend-verification");

      if (!response.success) {
        throw new Error(response.message);
      }

      toastAlert("success", "Verification email sent", response.message);
    } catch (error) {
      toastAlert(
        "error",
        "Unable to resend verification email",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="space-y-4">
      {user.role === "Candidate" ? <FieldAssociateIdCardPanel user={user} /> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Profile
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Manage your account details
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Update your display name and profile picture. Pictures are optimized automatically and kept under 1MB before upload.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleProfileSubmit(onSubmitProfile)} noValidate>
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Preview
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={user.name || "User avatar"}
                  className="size-20 rounded-[1.5rem] border border-border/70 object-cover shadow-sm"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">{user.role}</p>
                <p
                  className={`mt-1 text-xs font-medium ${
                    user.isEmailVerified ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {user.isEmailVerified ? "Email verified" : "Email not verified"}
                </p>
                {selectedFile ? (
                  <p className="mt-1 text-xs text-emerald-700">
                    New image selected: {selectedFile.name} ({Math.max(1, Math.round(selectedFile.size / 1024))} KB)
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current profile picture
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
              {!user.isEmailVerified ? (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isResendingVerification ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                  {isResendingVerification ? "Sending..." : "Resend verification"}
                </button>
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent">
                {isOptimizingAvatar ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {isOptimizingAvatar ? "Optimizing..." : "Choose photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={!selectedFile || isOptimizingAvatar}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-4" />
                Clear
              </button>
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isRemovingAvatar || isOptimizingAvatar}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRemovingAvatar ? <LoaderCircle className="size-4 animate-spin" /> : <UserRound className="size-4" />}
                Remove photo
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="profile-name">
              {t("Full Name", "पूरा नाम")}
            </label>
            <input
              id="profile-name"
              type="text"
              placeholder={t("Enter your full name", "अपना पूरा नाम दर्ज करें")}
              {...registerProfile("name")}
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
            />
            {profileErrors.name ? <p className="text-sm text-destructive">{profileErrors.name.message}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isProfileSubmitting || isOptimizingAvatar}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProfileSubmitting || isOptimizingAvatar ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                {isOptimizingAvatar ? "Optimizing photo..." : "Saving profile..."}
              </>
            ) : (
              "Save profile"
            )}
          </button>
        </form>
        </section>

        <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Security
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Change your password
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Use your current password to set a new one for this account.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit(onSubmitPassword)} noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="currentPassword">
              {t("Current Password", "वर्तमान पासवर्ड")}
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...registerPassword("currentPassword")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 pr-11 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordErrors.currentPassword ? (
              <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="newPassword">
              {t("New Password", "नया पासवर्ड")}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                {...registerPassword("newPassword")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 pr-11 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordErrors.newPassword ? (
              <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="confirmPassword">
              {t("Confirm New Password", "नए पासवर्ड की पुष्टि करें")}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...registerPassword("confirmPassword")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 pr-11 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {passwordErrors.confirmPassword ? (
              <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isPasswordSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPasswordSubmitting ? (
              <>
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>
        </section>
      </div>
    </div>
  );
}
