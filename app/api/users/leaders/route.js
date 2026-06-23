import { errorResponse, successResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { getLeadersForCandidate } from "@/lib/users/queries";

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { user } = auth;

    if (user.role !== "Candidate") {
      return errorResponse(403, "Only candidates can view their leaders");
    }

    const options = parseManagedUserListParams(req.nextUrl.searchParams);
    const data = await getLeadersForCandidate(user.id, options);

    return successResponse(200, "Leaders fetched successfully", {
      ...data,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
