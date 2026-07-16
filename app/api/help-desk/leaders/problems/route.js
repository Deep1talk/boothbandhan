import { getAdminLeaderProblems } from "@/lib/helpDesk";
import { errorResponse, successResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const options = parseManagedUserListParams(req.nextUrl.searchParams);
    const data = await getAdminLeaderProblems(auth.user.id, options);

    return successResponse(200, "Leader problems fetched successfully", data);
  } catch (error) {
    return errorResponse(
      500,
      error?.message || "Unable to fetch leader problems"
    );
  }
}
