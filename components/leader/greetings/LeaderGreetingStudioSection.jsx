"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import FestivalPosterPreview from "@/components/shared/posters/FestivalPosterPreview";
import { toastAlert } from "@/lib/toastAlert";

const MAX_POSTER_BYTES = 2 * 1024 * 1024;
const MAX_POSTER_DIMENSION = 1800;

function createMessage(templateTitle, profileName) {
  return encodeURIComponent(`${templateTitle} greeting poster by ${profileName}`);
}

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

async function compressPosterPhoto(file) {
  if (file.size <= MAX_POSTER_BYTES) {
    return file;
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(
    1,
    MAX_POSTER_DIMENSION / Math.max(image.width || 1, image.height || 1)
  );
  let width = Math.max(1, Math.round((image.width || 1) * scale));
  let height = Math.max(1, Math.round((image.height || 1) * scale));

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to optimize the selected image.");
  }

  const render = () => {
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
  };

  render();

  const mimeType = file.type === "image/png" ? "image/png" : file.type || "image/jpeg";
  let quality = mimeType === "image/png" ? undefined : 0.92;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) {
      throw new Error("Unable to optimize the selected image.");
    }

    if (blob.size <= MAX_POSTER_BYTES) {
      const outputName = file.name.replace(/\.[^.]+$/, "") || "leader-poster-photo";
      const extension = mimeType === "image/png" ? "png" : "jpg";

      return new File([blob], `${outputName}.${extension}`, {
        type: mimeType,
        lastModified: Date.now(),
      });
    }

    if (quality && quality > 0.5) {
      quality -= 0.08;
      continue;
    }

    width = Math.max(1, Math.round(width * 0.85));
    height = Math.max(1, Math.round(height * 0.85));
    render();
  }

  throw new Error("Please choose a smaller image. We could not optimize it below 2MB.");
}

export default function LeaderGreetingStudioSection({
  initialProfile,
  initialTemplates = [],
}) {
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [templates, setTemplates] = useState(initialTemplates);
  const [profileValues, setProfileValues] = useState({
    name: initialProfile?.name || "",
    greetingTagline: initialProfile?.greetingTagline || "",
    phone: initialProfile?.phone || "",
    whatsappNumber: initialProfile?.whatsappNumber || "",
    instagramHandle: initialProfile?.instagramHandle || "",
    twitterHandle: initialProfile?.twitterHandle || "",
    facebookHandle: initialProfile?.facebookHandle || "",
    posterPhotoScale: Number(initialProfile?.posterPhotoScale || 1),
    posterPhotoOffsetX: Number(initialProfile?.posterPhotoOffsetX || 0),
    posterPhotoOffsetY: Number(initialProfile?.posterPhotoOffsetY || 0),
  });
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [selectedPhotoPreviewUrl, setSelectedPhotoPreviewUrl] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplates[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [isOptimizingPhoto, setIsOptimizingPhoto] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [hasLeaderChangedTemplate, setHasLeaderChangedTemplate] = useState(false);

  const syncTemplates = (nextTemplates, options = {}) => {
    setTemplates(nextTemplates);
    setSelectedTemplateId((current) => {
      if (!nextTemplates.length) {
        return "";
      }

      if (options.preferLatest || !current) {
        return nextTemplates[0].id;
      }

      return nextTemplates.some((template) => template.id === current)
        ? current
        : nextTemplates[0].id;
    });
  };

  useEffect(() => () => {
    if (selectedPhotoPreviewUrl) {
      URL.revokeObjectURL(selectedPhotoPreviewUrl);
    }
  }, [selectedPhotoPreviewUrl]);

  useEffect(() => {
    let isMounted = true;

    async function fetchTemplates() {
      try {
        setIsLoadingTemplates(true);
        const { data: response } = await axios.get("/api/greeting-templates");
        const fetchedTemplates = response?.data?.templates || [];

        if (!isMounted) {
          return;
        }

        syncTemplates(fetchedTemplates, {
          preferLatest: !hasLeaderChangedTemplate,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toastAlert(
          "error",
          "Unable to load greeting templates",
          error.response?.data?.message || error.message || "Please try again."
        );
      } finally {
        if (isMounted) {
          setIsLoadingTemplates(false);
        }
      }
    }

    fetchTemplates();

    return () => {
      isMounted = false;
    };
  }, [hasLeaderChangedTemplate]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [selectedTemplateId, templates]
  );

  const previewProfile = useMemo(
    () => ({
      ...savedProfile,
      ...profileValues,
      posterPhoto: selectedPhotoPreviewUrl || savedProfile?.posterPhoto || savedProfile?.avatar || "",
    }),
    [profileValues, savedProfile, selectedPhotoPreviewUrl]
  );

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleChange = (key, value) => {
    setProfileValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const replaceSelectedPhotoFile = (file) => {
    if (selectedPhotoPreviewUrl) {
      URL.revokeObjectURL(selectedPhotoPreviewUrl);
    }

    setSelectedPhotoFile(file);
    setSelectedPhotoPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      replaceSelectedPhotoFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toastAlert("error", "Invalid image", "Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.type !== "image/png") {
      toastAlert(
        "info",
        "Background note",
        "Use a transparent PNG if you want the greeting template photo to appear without background. JPG/JPEG will keep its background."
      );
    }

    try {
      setIsOptimizingPhoto(true);
      const optimizedFile = await compressPosterPhoto(file);
      replaceSelectedPhotoFile(optimizedFile);
      toastAlert("success", "Photo ready", "Poster photo optimized successfully.");
    } catch (error) {
      replaceSelectedPhotoFile(null);
      toastAlert(
        "error",
        "Unable to optimize photo",
        error.message || "Please choose a smaller image."
      );
    } finally {
      setIsOptimizingPhoto(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      const formData = new FormData();

      Object.entries(profileValues).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      if (selectedPhotoFile) {
        formData.append("posterPhoto", selectedPhotoFile);
      }

      const { data: response } = await axios.put("/api/greeting-profile", formData);
      const savedProfile = response?.data?.profile;

      if (!savedProfile) {
        throw new Error(response?.message || "Profile save failed.");
      }

      setProfileValues({
        name: savedProfile.name || "",
        greetingTagline: savedProfile.greetingTagline || "",
        phone: savedProfile.phone || "",
        whatsappNumber: savedProfile.whatsappNumber || "",
        instagramHandle: savedProfile.instagramHandle || "",
        twitterHandle: savedProfile.twitterHandle || "",
        facebookHandle: savedProfile.facebookHandle || "",
        posterPhotoScale: Number(savedProfile.posterPhotoScale || 1),
        posterPhotoOffsetX: Number(savedProfile.posterPhotoOffsetX || 0),
        posterPhotoOffsetY: Number(savedProfile.posterPhotoOffsetY || 0),
      });
      setSavedProfile(savedProfile);
      replaceSelectedPhotoFile(null);
      toastAlert("success", "Greeting profile saved", response.message);
    } catch (error) {
      toastAlert(
        "error",
        "Unable to save greeting profile",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setIsRemovingPhoto(true);
      const { data: response } = await axios.delete("/api/greeting-profile");
      const savedProfile = response?.data?.profile;

      replaceSelectedPhotoFile(null);
      if (savedProfile) {
        setSavedProfile(savedProfile);
      }
      toastAlert("success", "Greeting photo removed", response.message);
    } catch (error) {
      toastAlert(
        "error",
        "Unable to remove greeting photo",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const shareMessage = createMessage(selectedTemplate?.title || "Festival greeting", profileValues.name || "Leader");

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
      <FestivalPosterPreview
        template={selectedTemplate}
        profile={previewProfile}
        showActions
      />

      <div className="space-y-4">
        <section className="rounded-[1.75rem] border border-border/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Greeting Template
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Build your personalized festival poster
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              Choose a live festival template, update your branding details, and export a share-ready greeting image without manual design work.
            </p>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSave}>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="leader-name">
                Name
              </label>
              <input
                id="leader-name"
                value={profileValues.name}
                onChange={(event) => handleChange("name", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="leader-tagline">
                Tagline / designation
              </label>
              <textarea
                id="leader-tagline"
                value={profileValues.greetingTagline}
                onChange={(event) => handleChange("greetingTagline", event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="leader-phone">
                Phone
              </label>
              <input
                id="leader-phone"
                value={profileValues.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="leader-whatsapp">
                WhatsApp
              </label>
              <input
                id="leader-whatsapp"
                value={profileValues.whatsappNumber}
                onChange={(event) => handleChange("whatsappNumber", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="leader-instagram">
                Instagram handle
              </label>
              <input
                id="leader-instagram"
                value={profileValues.instagramHandle}
                onChange={(event) => handleChange("instagramHandle", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="leader-twitter">
                X / Twitter handle
              </label>
              <input
                id="leader-twitter"
                value={profileValues.twitterHandle}
                onChange={(event) => handleChange("twitterHandle", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="leader-facebook">
                Facebook name / handle
              </label>
              <input
                id="leader-facebook"
                value={profileValues.facebookHandle}
                onChange={(event) => handleChange("facebookHandle", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="leader-photo">
                Poster profile photo
              </label>
              <div className="rounded-[1.25rem] border border-dashed border-border bg-slate-50 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent">
                    {isOptimizingPhoto ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
                    {isOptimizingPhoto ? "Optimizing..." : "Choose photo"}
                    <input
                      id="leader-photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isRemovingPhoto}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRemovingPhoto ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    Remove saved photo
                  </button>
                </div>
                <p className="mt-3 text-xs leading-6 text-muted-foreground">
                  Use a portrait photo with clear separation from the background. The crop controls below help position it cleanly in the poster even if background removal is not used.
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Upload a transparent PNG if you want the greeting template to show the profile photo without any background.
                </p>
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="leader-template">
                Active festival template
              </label>
              <select
                id="leader-template"
                value={selectedTemplateId}
                onChange={(event) => {
                  setHasLeaderChangedTemplate(true);
                  setSelectedTemplateId(event.target.value);
                }}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
              {!templates.length && !isLoadingTemplates ? (
                <p className="text-xs text-amber-700">
                  No live greeting template is available right now. Ask admin to activate and publish one.
                </p>
              ) : null}
              {isLoadingTemplates ? (
                <p className="text-xs text-muted-foreground">
                  Loading live templates...
                </p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Photo zoom</label>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={profileValues.posterPhotoScale}
                onChange={(event) => handleChange("posterPhotoScale", event.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Horizontal crop</label>
              <input
                type="range"
                min="-220"
                max="220"
                step="2"
                value={profileValues.posterPhotoOffsetX}
                onChange={(event) => handleChange("posterPhotoOffsetX", event.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vertical crop</label>
              <input
                type="range"
                min="-220"
                max="360"
                step="2"
                value={profileValues.posterPhotoOffsetY}
                onChange={(event) => handleChange("posterPhotoOffsetY", event.target.value)}
                className="w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSaving || isOptimizingPhoto}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : null}
                Save greeting profile
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Quick Share
          </p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">
            Social share intents
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${shareMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              X / Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareMessage}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              Facebook
            </a>
          </div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">
            For the actual poster image file, use the Generate or Share buttons in the preview panel.
          </p>
        </section>
      </div>
    </div>
  );
}
