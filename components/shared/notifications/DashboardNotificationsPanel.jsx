"use client";

import { useState } from "react";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useRemoteData } from "@/hooks/useRemoteData";
import { toastAlert } from "@/lib/toastAlert";
import {
  getMyNotifications,
  markMyNotificationRead,
} from "@/lib/client/notificationsClient";

const NOTIFICATIONS_PER_PAGE = 3;

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardNotificationsPanel({ accent = "sky" }) {
  const [markingId, setMarkingId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const {
    data,
    setData,
    isLoading,
  } = useRemoteData(getMyNotifications, {
    initialData: {
      notifications: [],
    },
    onError: (error) => {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to load notifications."
      );
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const totalPages = Math.max(1, Math.ceil(notifications.length / NOTIFICATIONS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
  const visibleNotifications = notifications.slice(
    startIndex,
    startIndex + NOTIFICATIONS_PER_PAGE
  );
  const tone =
    accent === "emerald"
      ? {
          ring: "border-emerald-200",
          soft: "bg-emerald-50 text-emerald-900",
          button: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100",
          unread: "border-emerald-200 bg-white",
          read: "border-slate-200 bg-slate-50/80",
        }
      : {
          ring: "border-sky-200",
          soft: "bg-sky-50 text-sky-900",
          button: "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100",
          unread: "border-sky-200 bg-white",
          read: "border-slate-200 bg-slate-50/80",
        };

  const handleMarkRead = async (notificationId) => {
    try {
      setMarkingId(notificationId);
      const notification = await markMyNotificationRead(notificationId);

      setData((current) => ({
        notifications: (current?.notifications || []).map((item) =>
          item.id === notification.id ? notification : item
        ),
      }));
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to mark notification as read."
      );
    } finally {
      setMarkingId("");
    }
  };

  return (
    <section className={`rounded-[1.75rem] border bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5 ${tone.ring}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.soft}`}>
            <Bell className="size-3.5" />
            Notifications
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Latest announcements</h3>
          <p className="mt-1 text-sm text-slate-600">
            {unreadCount ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`inline-flex min-h-11 items-center rounded-2xl px-4 py-2 text-sm font-semibold ${tone.soft}`}>
            {notifications.length} notification{notifications.length === 1 ? "" : "s"}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className={`inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition ${tone.button}`}
          >
            {isOpen ? "Hide notifications" : "View notifications"}
          </button>
        </div>
      </div>

      {!isOpen ? null : isLoading ? (
        <div className="mt-4 rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Loading notifications...
        </div>
      ) : notifications.length ? (
        <div className="mt-4 space-y-3">
          {visibleNotifications.map((notification) => {
            const isBusy = markingId === notification.id;

            return (
              <article
                key={notification.id}
                className={`rounded-[1.35rem] border p-4 shadow-sm transition ${notification.isRead ? tone.read : tone.unread}`}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                          notification.isRead
                            ? "bg-slate-200 text-slate-700"
                            : tone.soft
                        }`}
                      >
                        {notification.isRead ? "Read" : "New"}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {formatDate(notification.createdDate)}
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">
                      {notification.title}
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                  </div>

                  {notification.isRead ? (
                    <div className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      <CheckCheck className="size-4" />
                      Read
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={isBusy}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${tone.button}`}
                    >
                      {isBusy ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
                      Mark as read
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {totalPages > 1 ? (
            <div className="flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Showing {startIndex + 1}-
                {Math.min(startIndex + NOTIFICATIONS_PER_PAGE, notifications.length)} of{" "}
                {notifications.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, Math.min(currentPage, current) - 1))}
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
                  onClick={() => setPage((current) => Math.min(totalPages, Math.min(currentPage, current) + 1))}
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
        <div className="mt-4 rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          No active announcements right now.
        </div>
      )}
    </section>
  );
}
