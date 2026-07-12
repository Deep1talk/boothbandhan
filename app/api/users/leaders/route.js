import { errorResponse, successResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { getLeadersForAdmin, getLeadersForCandidate } from "@/lib/users/queries";

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { user } = auth;

    if (user.role === "Candidate") {
      const options = parseManagedUserListParams(req.nextUrl.searchParams);
      const data = await getLeadersForCandidate(user.id, options);

      return successResponse(200, "Leaders fetched successfully", {
        ...data,
      });
    }

    if (user.role === "Admin") {
      const options = parseManagedUserListParams(req.nextUrl.searchParams);
      const data = await getLeadersForAdmin(user.id, options);

      return successResponse(200, "Leaders fetched successfully", {
        ...data,
      });
    }

    return errorResponse(403, "Only candidates and admins can view leaders");
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
