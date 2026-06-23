import { errorResponse, successResponse } from "@/lib/helper";
import {
  createHelpDeskProblem,
  getLeaderHelpDeskProblems,
} from "@/lib/helpDesk";
import { requireRequestUser } from "@/lib/server/requestUser";

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req, ["Leader"]);

    if (!auth.ok) {
      return auth.response;
    }

    const problems = await getLeaderHelpDeskProblems(auth.user.id);

    return successResponse(200, "Help desk problems fetched successfully", {
      problems,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to fetch help desk problems");
  }
}

export async function POST(req) {
  try {
    const auth = await requireRequestUser(req, ["Leader"]);

    if (!auth.ok) {
      return auth.response;
    }

    const body = await req.json();
    const result = await createHelpDeskProblem(auth.user.id, body);

    if (!result.ok) {
      return errorResponse(result.status, result.message, result.error);
    }

    return successResponse(201, "Problem submitted successfully", {
      problem: result.problem,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to submit problem");
  }
}
