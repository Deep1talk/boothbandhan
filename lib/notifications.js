import "server-only";

import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import NotificationModel from "@/models/notificationSchema";
import NotificationReadModel from "@/models/notificationReadSchema";

export const NOTIFICATION_TARGETS = ["Candidate", "Leader"];
export const NOTIFICATION_STATUSES = ["Active", "Inactive"];

function normalizeOptionalLocation(value) {
  return String(value || "").trim();
}

function normalizeTargetAudience(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.filter((item) => NOTIFICATION_TARGETS.includes(item)))];
  }

  if (value === "Both") {
    return [...NOTIFICATION_TARGETS];
  }

  return NOTIFICATION_TARGETS.includes(value) ? [value] : [];
}

export function parseNotificationPayload(payload = {}) {
  const title = String(payload.title || "").trim();
  const message = String(payload.message || "").trim();
  const targetAudience = normalizeTargetAudience(payload.targetAudience);
  const status = NOTIFICATION_STATUSES.includes(payload.status) ? payload.status : "";
  const district = normalizeOptionalLocation(payload.district);

  if (!title) {
    throw new Error("Title is required");
  }

  if (!message) {
    throw new Error("Message is required");
  }

  if (!targetAudience.length) {
    throw new Error("Target audience is required");
  }

  if (!status) {
    throw new Error("Status is required");
  }

  return {
    title,
    message,
    targetAudience,
    status,
    district,
  };
}

function serializeNotification(notification, readMap = new Map()) {
  const id = notification._id.toString();
  const readAt = readMap.get(id) || null;

  return {
    id,
    title: notification.title,
    message: notification.message,
    targetAudience: notification.targetAudience,
    status: notification.status,
    district: notification.district || "",
    createdDate: notification.createdAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    isRead: Boolean(readAt),
    readAt,
  };
}

export async function createNotification(adminUserId, payload) {
  await connectDB();

  const data = parseNotificationPayload(payload);

  const notification = await NotificationModel.create({
    ...data,
    createdBy: adminUserId,
  });

  return serializeNotification(notification.toObject());
}

export async function listNotificationsForAdmin() {
  await connectDB();

  const notifications = await NotificationModel.find({})
    .sort({ createdAt: -1 })
    .lean();

  return notifications.map((item) => serializeNotification(item));
}

export async function updateNotificationStatus(notificationId, status) {
  await connectDB();

  if (!mongoose.isValidObjectId(notificationId)) {
    return null;
  }

  if (!NOTIFICATION_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }

  const notification = await NotificationModel.findByIdAndUpdate(
    notificationId,
    { status },
    { new: true }
  ).lean();

  if (!notification) {
    return null;
  }

  return serializeNotification(notification);
}

export async function getNotificationsForUser(userId, role, options = {}) {
  await connectDB();

  if (!mongoose.isValidObjectId(userId) || !NOTIFICATION_TARGETS.includes(role)) {
    return [];
  }

  const userDistrict = normalizeOptionalLocation(options.district);

  const notifications = await NotificationModel.find({
    status: "Active",
    targetAudience: role,
  })
    .sort({ createdAt: -1 })
    .lean();

  const filteredNotifications = notifications.filter((notification) => {
    const notificationDistrict = normalizeOptionalLocation(notification.district);

    if (
      notificationDistrict &&
      notificationDistrict.toLowerCase() !== userDistrict.toLowerCase()
    ) {
      return false;
    }

    return true;
  });

  if (!filteredNotifications.length) {
    return [];
  }

  const notificationIds = filteredNotifications.map((item) => item._id);
  const reads = await NotificationReadModel.find({
    userId,
    notificationId: { $in: notificationIds },
  }).lean();

  const readMap = new Map(
    reads.map((item) => [item.notificationId.toString(), item.readAt])
  );

  return filteredNotifications.map((item) => serializeNotification(item, readMap));
}

export async function markNotificationAsRead(notificationId, userId, role, options = {}) {
  await connectDB();

  if (
    !mongoose.isValidObjectId(notificationId) ||
    !mongoose.isValidObjectId(userId) ||
    !NOTIFICATION_TARGETS.includes(role)
  ) {
    return null;
  }

  const userDistrict = normalizeOptionalLocation(options.district);

  const notification = await NotificationModel.findOne({
    _id: notificationId,
    status: "Active",
    targetAudience: role,
  }).lean();

  if (!notification) {
    return null;
  }

  const notificationDistrict = normalizeOptionalLocation(notification.district);

  if (notificationDistrict && notificationDistrict.toLowerCase() !== userDistrict.toLowerCase()) {
    return null;
  }

  await NotificationReadModel.updateOne(
    {
      notificationId,
      userId,
    },
    {
      $setOnInsert: {
        readAt: new Date(),
      },
    },
    {
      upsert: true,
    }
  );

  const read = await NotificationReadModel.findOne({
    notificationId,
    userId,
  }).lean();

  const readMap = new Map([[notificationId.toString(), read?.readAt || new Date()]]);

  return serializeNotification(notification, readMap);
}
