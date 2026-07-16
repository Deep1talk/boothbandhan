import { errorResponse, successResponse } from "@/lib/helper";
import { getLeaderHelpDeskProblemsPage } from "@/lib/helpDesk";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { findAdminManagedUser } from "@/lib/users/queries";

export async function GET(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { leaderId } = await params;
    const managedLeader = await findAdminManagedUser(auth.user.id, leaderId);

    if (!managedLeader || managedLeader.role !== "Leader") {
      return errorResponse(404, "Leader not found");
    }

    const options = parseManagedUserListParams(req.nextUrl.searchParams);
    const data = await getLeaderHelpDeskProblemsPage(leaderId, options);

    return successResponse(200, "Leader problems fetched successfully", {
      ...data,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to fetch leader problems");
  }
}
