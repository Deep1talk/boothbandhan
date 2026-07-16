"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { LoaderCircle, Pencil, PlusCircle, Trash2 } from "lucide-react";
import FestivalPosterPreview from "@/components/shared/posters/FestivalPosterPreview";
import { POSTER_FONT_OPTIONS, SAMPLE_POSTER_PROFILE } from "@/lib/posters";
import { toastAlert } from "@/lib/toastAlert";

const ADMIN_SAMPLE_POSTER_PROFILE = {
  ...SAMPLE_POSTER_PROFILE,
  posterPhotoScale: 0.5,
};

const EMPTY_FORM = {
  title: "",
  cardBackgroundColor: "#f6c453",
  contactStripBackgroundColor: "#0b0b0b",
  nameTextColor: "#1f2937",
  taglineTextColor: "#7c2d12",
  contactTextColor: "#1f2937",
  fontFamily: "Assistant",
  isActive: true,
  startDate: "",
  endDate: "",
};

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 10);
}

function buildFormFromTemplate(template) {
  if (!template) {
    return EMPTY_FORM;
  }

  return {
    title: template.title || "",
    cardBackgroundColor: template.cardBackgroundColor || "#f6c453",
    contactStripBackgroundColor: template.contactStripBackgroundColor || "#0b0b0b",
    nameTextColor: template.nameTextColor || "#1f2937",
    taglineTextColor: template.taglineTextColor || "#7c2d12",
    contactTextColor: template.contactTextColor || "#1f2937",
    fontFamily: template.fontFamily || "Assistant",
    isActive: Boolean(template.isActive),
    startDate: formatDateForInput(template.startDate),
    endDate: formatDateForInput(template.endDate),
  };
}

export default function AdminGreetingTemplatesSection({ initialTemplates = [] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplates[0]?.id || null);
  const [formValues, setFormValues] = useState(
    initialTemplates[0] ? buildFormFromTemplate(initialTemplates[0]) : EMPTY_FORM
  );
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId) || null,
    [selectedTemplateId, templates]
  );

  useEffect(() => () => {
    if (backgroundPreviewUrl) {
      URL.revokeObjectURL(backgroundPreviewUrl);
    }
  }, [backgroundPreviewUrl]);

  const replaceBackgroundFile = (file) => {
    if (backgroundPreviewUrl) {
      URL.revokeObjectURL(backgroundPreviewUrl);
    }

    setBackgroundFile(file);
    setBackgroundPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const previewTemplate = useMemo(() => {
    if (!formValues.title && !selectedTemplate && !backgroundPreviewUrl) {
      return null;
    }

    return {
      ...selectedTemplate,
      title: formValues.title || selectedTemplate?.title || "New festival template",
      backgroundImage: backgroundPreviewUrl || selectedTemplate?.backgroundImage || "",
      cardBackgroundColor: formValues.cardBackgroundColor,
      contactStripBackgroundColor: formValues.contactStripBackgroundColor,
      nameTextColor: formValues.nameTextColor,
      taglineTextColor: formValues.taglineTextColor,
      contactTextColor: formValues.contactTextColor,
      fontFamily: formValues.fontFamily,
      slug: selectedTemplate?.slug || "festival-template-preview",
    };
  }, [backgroundPreviewUrl, formValues, selectedTemplate]);

  const resetComposer = () => {
    setSelectedTemplateId(null);
    setFormValues(EMPTY_FORM);
    replaceBackgroundFile(null);
  };

  const handleTemplatePick = (template) => {
    setSelectedTemplateId(template.id);
    setFormValues(buildFormFromTemplate(template));
    replaceBackgroundFile(null);
  };

  const handleChange = (key, value) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, String(value ?? ""));
      });

      if (backgroundFile) {
        formData.append("backgroundImage", backgroundFile);
      }

      const endpoint = selectedTemplateId
        ? `/api/greeting-templates/${selectedTemplateId}`
        : "/api/greeting-templates";
      const method = selectedTemplateId ? "patch" : "post";
      const { data: response } = await axios[method](endpoint, formData);
      const savedTemplate = response?.data?.template;

      if (!savedTemplate) {
        throw new Error(response?.message || "Template save failed.");
      }

      setTemplates((current) => {
        if (selectedTemplateId) {
          return current.map((item) => (item.id === savedTemplate.id ? savedTemplate : item));
        }

        return [savedTemplate, ...current];
      });

      setSelectedTemplateId(savedTemplate.id);
      setFormValues(buildFormFromTemplate(savedTemplate));
      replaceBackgroundFile(null);
      toastAlert("success", "Template saved", response.message);
    } catch (error) {
      toastAlert(
        "error",
        "Unable to save template",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplateId || !selectedTemplate) {
      return;
    }

    const shouldDelete = window.confirm(`Delete "${selectedTemplate.title}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      const { data: response } = await axios.delete(`/api/greeting-templates/${selectedTemplateId}`);

      setTemplates((current) => current.filter((item) => item.id !== selectedTemplateId));
      resetComposer();
      toastAlert("success", "Template deleted", response.message);
    } catch (error) {
      toastAlert(
        "error",
        "Unable to delete template",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <FestivalPosterPreview
        template={previewTemplate}
        profile={ADMIN_SAMPLE_POSTER_PROFILE}
        backgroundPreviewUrl={backgroundPreviewUrl}
      />

      <div className="space-y-4">
        <section className="rounded-[1.75rem] border border-border/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Admin Tools
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                Festival greeting templates
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Upload a background, theme the name and contact card, and publish timed templates leaders can use instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={resetComposer}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              <PlusCircle className="size-4" />
              New template
            </button>
          </div>

          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="template-title">
                Festival / occasion label
              </label>
              <input
                id="template-title"
                value={formValues.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="Diwali 2026"
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="template-image">
                Background image
              </label>
              <input
                id="template-image"
                type="file"
                accept="image/*"
                onChange={(event) => replaceBackgroundFile(event.target.files?.[0] || null)}
                className="block w-full rounded-xl border border-dashed border-border bg-slate-50 px-3 py-3 text-sm text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Upload a finished festival background that already contains the decorative artwork and headline.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Card background color</label>
              <input
                type="color"
                value={formValues.cardBackgroundColor}
                onChange={(event) => handleChange("cardBackgroundColor", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white p-1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Social strip color</label>
              <input
                type="color"
                value={formValues.contactStripBackgroundColor}
                onChange={(event) => handleChange("contactStripBackgroundColor", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white p-1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name text color</label>
              <input
                type="color"
                value={formValues.nameTextColor}
                onChange={(event) => handleChange("nameTextColor", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white p-1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline text color</label>
              <input
                type="color"
                value={formValues.taglineTextColor}
                onChange={(event) => handleChange("taglineTextColor", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white p-1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact text color</label>
              <input
                type="color"
                value={formValues.contactTextColor}
                onChange={(event) => handleChange("contactTextColor", event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white p-1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="template-font">
                Font family
              </label>
              <select
                id="template-font"
                value={formValues.fontFamily}
                onChange={(event) => handleChange("fontFamily", event.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              >
                {POSTER_FONT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-slate-50 px-4 py-3">
                <input
                  id="template-active"
                  type="checkbox"
                  checked={formValues.isActive}
                  onChange={(event) => handleChange("isActive", event.target.checked)}
                  className="size-4 rounded border-border text-primary"
                />
                <label className="text-sm font-medium text-foreground" htmlFor="template-active">
                  Template active
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="template-start-date">
                    Start date
                  </label>
                  <input
                    id="template-start-date"
                    type="date"
                    value={formValues.startDate}
                    onChange={(event) => handleChange("startDate", event.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="template-end-date">
                    End date
                  </label>
                  <input
                    id="template-end-date"
                    type="date"
                    value={formValues.endDate}
                    onChange={(event) => handleChange("endDate", event.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                {selectedTemplateId ? "Update template" : "Create template"}
              </button>
              {selectedTemplateId ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete template
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-border/60 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Template Library
              </p>
              <h3 className="mt-1 text-xl font-semibold text-foreground">
                Existing festival designs
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {templates.length} total
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {templates.map((template) => (
              <article
                key={template.id}
                className={`rounded-[1.5rem] border p-3 transition ${
                  selectedTemplateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-slate-50/70"
                }`}
              >
                <FestivalPosterPreview
                  template={template}
                  profile={ADMIN_SAMPLE_POSTER_PROFILE}
                  className="border-0 bg-transparent p-0 shadow-none"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{template.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.isCurrentlyLive ? "Live for leaders now" : template.isActive ? "Active but outside schedule" : "Inactive"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTemplatePick(template)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </button>
                </div>
              </article>
            ))}

            {!templates.length ? (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-slate-50/70 p-6 text-sm leading-7 text-muted-foreground">
                No templates yet. Create the first festival background to unlock the leader greeting studio.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
