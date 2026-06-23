import { errorResponse, successResponse } from "@/lib/helper";
import { requireRequestUser } from "@/lib/server/requestUser";
import { findAdminManagedUser, setManagedUserLock } from "@/lib/users/queries";

export async function POST(req, { params }) {
  try {
    const auth = await requireRequestUser(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { user } = auth;

    if (user.role !== "Admin") {
      return errorResponse(403, "Only admins can lock users");
    }

    const { userId } = await params;
    const target = await findAdminManagedUser(user.id, userId);

    if (!target) {
      return errorResponse(404, "Managed user not found");
    }

    let reason = "";
    let body = null;

    try {
      body = await req.json();
    } catch {
      body = null;
    }

    reason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const updatedUser = await setManagedUserLock(userId, true, reason);

    return successResponse(200, "User locked successfully", {
      user: updatedUser,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireRequestUser(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { user } = auth;

    if (user.role !== "Admin") {
      return errorResponse(403, "Only admins can unlock users");
    }

    const { userId } = await params;
    const target = await findAdminManagedUser(user.id, userId);

    if (!target) {
      return errorResponse(404, "Managed user not found");
    }
    const updatedUser = await setManagedUserLock(userId, false);

    return successResponse(200, "User unlocked successfully", {
      user: updatedUser,
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Internal server error");
  }
}
