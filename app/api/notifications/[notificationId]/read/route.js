import { requireRequestUser } from "@/lib/server/requestUser";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { markNotificationAsRead } from "@/lib/notifications";

export async function POST(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Candidate", "Leader"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { notificationId } = await params;
    const notification = await markNotificationAsRead(
      notificationId,
      auth.user.id,
      auth.user.role,
      {
        district: auth.user.district,
      }
    );

    if (!notification) {
      return errorResponse(404, "Notification not found");
    }

    return successResponse(200, "Notification marked as read", {
      notification,
    });
  } catch (error) {
    return catchError(error);
  }
}
