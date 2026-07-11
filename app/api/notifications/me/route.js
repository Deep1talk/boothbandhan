import { requireRequestUser } from "@/lib/server/requestUser";
import { catchError, successResponse } from "@/lib/helper";
import { getNotificationsForUser } from "@/lib/notifications";

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req, ["Candidate", "Leader"]);

    if (!auth.ok) {
      return auth.response;
    }

    const notifications = await getNotificationsForUser(
      auth.user.id,
      auth.user.role,
      {
        district: auth.user.district,
      }
    );

    return successResponse(200, "Notifications fetched successfully", {
      notifications,
    });
  } catch (error) {
    return catchError(error);
  }
}
