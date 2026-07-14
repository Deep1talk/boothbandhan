import { verifyEmailTokenAndMarkUser } from "@/lib/emailVerification";
import { catchError, errorResponse, successResponse } from "@/lib/helper";

export async function POST(req) {
  try {
    const { token } = await req.json();
    const result = await verifyEmailTokenAndMarkUser(token);

    if (!result.ok) {
      return errorResponse(result.status || 400, result.message);
    }

    return successResponse(result.status || 200, result.message, {
      code: result.code,
    });
  } catch (err) {
    return catchError(err);
  }
}
