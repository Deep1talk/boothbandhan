import { requireRequestUser } from "@/lib/server/requestUser";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import {
  createNotification,
  listNotificationsForAdmin,
} from "@/lib/notifications";

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const notifications = await listNotificationsForAdmin();

    return successResponse(200, "Announcements fetched successfully", {
      notifications,
    });
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(req) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const payload = await req.json();
    const notification = await createNotification(auth.user.id, payload);

    return successResponse(201, "Announcement created successfully", {
      notification,
    });
  } catch (error) {
    return errorResponse(400, error?.message || "Unable to create announcement");
  }
}
