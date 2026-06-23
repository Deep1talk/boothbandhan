import { errorResponse, successResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { getCandidateLeadersForAdmin } from "@/lib/users/queries";

export async function GET(req, { params }) {
  try {
    const auth = await requireRequestUser(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { user } = auth;

    if (user.role !== "Admin") {
      return errorResponse(403, "Only admins can view candidate leaders");
    }

    const { candidateId } = await params;
    const options = parseManagedUserListParams(req.nextUrl.searchParams);
    const data = await getCandidateLeadersForAdmin(user.id, candidateId, options);

    if (!data) {
      return errorResponse(404, "Candidate not found");
    }

    return successResponse(200, "Candidate leaders fetched successfully", {
      ...data,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
