"use client";

import { useState } from "react";
import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Megaphone,
  Users,
} from "lucide-react";
import { useRemoteData } from "@/hooks/useRemoteData";
import { toastAlert } from "@/lib/toastAlert";
import {
  createAnnouncement,
  getAdminAnnouncements,
  updateAnnouncementStatus,
} from "@/lib/client/notificationsClient";
import { BIHAR_DISTRICTS } from "@/lib/leaderRegistration";

const ANNOUNCEMENTS_PER_PAGE = 10;

const AUDIENCE_OPTIONS = [
  {
    value: "Candidate",
    label: "Field Associates",
    detail: "Visible only to field associate accounts.",
  },
  {
    value: "Leader",
    label: "Leaders",
    detail: "Visible only to leader accounts.",
  },
  {
    value: "Both",
    label: "Both",
    detail: "Visible to both field associates and leaders.",
  },
];

const STATUS_OPTIONS = ["Active", "Inactive"];

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getAudienceValue(targetAudience = []) {
  if (targetAudience.includes("Candidate") && targetAudience.includes("Leader")) {
    return "Both";
  }

  return targetAudience[0] || "";
}

export default function AdminAnnouncementsSection() {
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetAudience: "Both",
    district: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [page, setPage] = useState(1);

  const {
    data,
    setData,
    isLoading,
    refresh,
  } = useRemoteData(getAdminAnnouncements, {
    initialData: {
      notifications: [],
    },
    onError: (error) => {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to load announcements."
      );
    },
  });

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const notification = await createAnnouncement(form);

      setData((current) => ({
        notifications: [notification, ...(current?.notifications || [])],
      }));
      setPage(1);
      setForm({
        title: "",
        message: "",
        targetAudience: "Both",
        district: "",
        status: "Active",
      });
      toastAlert("success", "Announcement created successfully.");
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to create announcement."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (notification) => {
    const nextStatus = notification.status === "Active" ? "Inactive" : "Active";

    try {
      setUpdatingId(notification.id);
      const updatedNotification = await updateAnnouncementStatus(
        notification.id,
        nextStatus
      );

      setData((current) => ({
        notifications: (current?.notifications || []).map((item) =>
          item.id === updatedNotification.id ? updatedNotification : item
        ),
      }));
      toastAlert("success", `Announcement marked ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Unable to update announcement status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const notifications = data?.notifications || [];
  const totalPages = Math.max(
    1,
    Math.ceil(notifications.length / ANNOUNCEMENTS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ANNOUNCEMENTS_PER_PAGE;
  const visibleNotifications = notifications.slice(
    startIndex,
    startIndex + ANNOUNCEMENTS_PER_PAGE
  );
  const activeCount = notifications.filter((item) => item.status === "Active").length;
  const inactiveCount = notifications.filter((item) => item.status === "Inactive").length;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-[0_24px_70px_rgba(249,115,22,0.10)] sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              Notifications
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Create announcement
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Publish dashboard notifications for field associates, leaders, or both.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-orange-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{activeCount}</p>
            </div>
            <div className="rounded-[1.25rem] border border-orange-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Inactive
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{inactiveCount}</p>
            </div>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-800">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="Enter notification title"
                className="min-h-12 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                maxLength={160}
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-800">Created date</span>
              <input
                type="text"
                value={formatDate(new Date().toISOString())}
                readOnly
                className="min-h-12 w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-slate-700 outline-none"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">Message</span>
            <textarea
              value={form.message}
              onChange={(event) => handleChange("message", event.target.value)}
              placeholder="Write the announcement message"
              className="min-h-32 w-full rounded-[1.4rem] border border-orange-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
              maxLength={2000}
              required
            />
          </label>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-800">District</span>
              <select
                value={form.district}
                onChange={(event) => handleChange("district", event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
              >
                <option value="">All districts</option>
                {BIHAR_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <p className="text-sm font-medium text-slate-800">Target audience</p>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {AUDIENCE_OPTIONS.map((option) => {
                  const isSelected = form.targetAudience === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange("targetAudience", option.value)}
                      className={`rounded-[1.35rem] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-orange-400 bg-orange-500 text-white shadow-lg"
                          : "border-orange-200 bg-white text-slate-900 hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        <span className="text-sm font-semibold">{option.label}</span>
                      </div>
                      <p
                        className={`mt-2 text-xs leading-5 ${
                          isSelected ? "text-orange-50" : "text-slate-600"
                        }`}
                      >
                        {option.detail}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-800">Status</span>
              <select
                value={form.status}
                onChange={(event) => handleChange("status", event.target.value)}
                className="min-h-12 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Megaphone className="size-4" />}
              {isSubmitting ? "Publishing..." : "Create announcement"}
            </button>
            <button
              type="button"
              onClick={() => refresh()}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-orange-50"
            >
              Refresh list
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-white/80 bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Existing
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              Announcement history
            </h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <BellRing className="size-4" />
            {notifications.length} total
          </div>
        </div>

        {isLoading ? (
          <div className="mt-5 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Loading announcements...
          </div>
        ) : notifications.length ? (
          <div className="mt-5 space-y-3">
            {visibleNotifications.map((notification) => {
              const audienceValue = getAudienceValue(notification.targetAudience);
              const isUpdating = updatingId === notification.id;

              return (
                <article
                  key={notification.id}
                  className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            notification.status === "Active"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {notification.status}
                        </span>
                        <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-900">
                          {audienceValue}
                        </span>
                      </div>
                      <h4 className="mt-3 text-lg font-semibold text-slate-900">
                        {notification.title}
                      </h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                          District: {notification.district || "All"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-medium text-slate-500">
                        Created {formatDate(notification.createdDate)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(notification)}
                      disabled={isUpdating}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                        notification.status === "Active"
                          ? "border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                      }`}
                    >
                      {isUpdating ? <LoaderCircle className="size-4 animate-spin" /> : null}
                      {notification.status === "Active" ? "Mark inactive" : "Mark active"}
                    </button>
                  </div>
                </article>
              );
            })}

            {totalPages > 1 ? (
              <div className="flex flex-col gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Showing {startIndex + 1}-
                  {Math.min(startIndex + ANNOUNCEMENTS_PER_PAGE, notifications.length)} of{" "}
                  {notifications.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, Math.min(currentPage, current) - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="size-4" />
                    Prev
                  </button>
                  <div className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, Math.min(currentPage, current) + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
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
            No announcements created yet.
          </div>
        )}
      </section>
    </div>
  );
}
