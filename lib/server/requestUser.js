import { getLockedUserMessage, getRequestUser } from "@/lib/authUser";
import { errorResponse } from "@/lib/helper";

export async function requireRequestUser(req, allowedRoles = []) {
  const { session, user } = await getRequestUser(req);

  if (!session?.userId || !user) {
    return {
      ok: false,
      response: errorResponse(401, "Unauthorized"),
    };
  }

  if (user.isLocked) {
    return {
      ok: false,
      response: errorResponse(403, getLockedUserMessage(user)),
    };
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return {
      ok: false,
      response: errorResponse(403, `Only ${allowedRoles.join(" or ").toLowerCase()} can access this resource`),
    };
  }

  return {
    ok: true,
    session,
    user,
  };
}

