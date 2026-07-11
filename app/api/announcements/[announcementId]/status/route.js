import { requireRequestUser } from "@/lib/server/requestUser";
import { catchError, errorResponse, successResponse } from "@/lib/helper";
import { updateNotificationStatus } from "@/lib/notifications";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { announcementId } = await params;
    const payload = await req.json();
    const notification = await updateNotificationStatus(
      announcementId,
      payload?.status
    );

    if (!notification) {
      return errorResponse(404, "Announcement not found");
    }

    return successResponse(200, "Announcement status updated successfully", {
      notification,
    });
  } catch (error) {
    return errorResponse(
      400,
      error?.message || "Unable to update announcement status"
    );
  }
}
