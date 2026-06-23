import { errorResponse, successResponse } from "@/lib/helper";
import { requireRequestUser } from "@/lib/server/requestUser";
import { findCandidateManagedLeader, markLeaderRegistrationUnpaid } from "@/lib/users/registrationPayments";
import { toManagedUserPayload } from "@/lib/users/presenters";

export async function POST(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Candidate"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { userId } = await params;
    const leader = await findCandidateManagedLeader(auth.user.id, userId);

    if (!leader) {
      return errorResponse(404, "Leader not found");
    }

    const updatedLeader = await markLeaderRegistrationUnpaid(leader._id.toString());

    return successResponse(200, "Leader marked as unpaid and locked", {
      user: toManagedUserPayload(updatedLeader),
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to mark leader as unpaid");
  }
}
