import { errorResponse, successResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { getCandidatesForAdmin } from "@/lib/users/queries";

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { user } = auth;

    if (user.role !== "Admin") {
      return errorResponse(403, "Only admins can view candidates");
    }

    const options = parseManagedUserListParams(req.nextUrl.searchParams);
    const data = await getCandidatesForAdmin(user.id, options);

    return successResponse(200, "Candidates fetched successfully", {
      ...data,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
