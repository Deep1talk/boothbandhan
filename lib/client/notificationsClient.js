"use client";

import axios from "axios";

export async function getAdminAnnouncements() {
  const { data: response } = await axios.get("/api/announcements");
  return response.data;
}

export async function createAnnouncement(payload) {
  const { data: response } = await axios.post("/api/announcements", payload);
  return response.data?.notification ?? null;
}

export async function updateAnnouncementStatus(announcementId, status) {
  const { data: response } = await axios.patch(
    `/api/announcements/${announcementId}/status`,
    { status }
  );

  return response.data?.notification ?? null;
}

export async function getMyNotifications() {
  const { data: response } = await axios.get("/api/notifications/me");
  return response.data;
}

export async function markMyNotificationRead(notificationId) {
  const { data: response } = await axios.post(
    `/api/notifications/${notificationId}/read`
  );

  return response.data?.notification ?? null;
}
