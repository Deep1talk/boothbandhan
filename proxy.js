import { NextResponse } from "next/server";
import { getDefaultRouteForRole, getRequiredRoleForPath } from "@/lib/authRedirect";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/authToken";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";

const AUTH_ROUTE_PREFIX = "/auth";
const EMAIL_VERIFICATION_ROUTE_PREFIX = "/auth/verify-email";

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const requiredRole = getRequiredRoleForPath(pathname);
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifyAuthToken(token);

  if (requiredRole && !session?.userId) {
    const loginUrl = new URL(WEBSITE_LOGIN, request.url);
    loginUrl.searchParams.set("callback", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (requiredRole && session?.role !== requiredRole) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(session?.role), request.url));
  }

  if (
    pathname.startsWith(AUTH_ROUTE_PREFIX) &&
    !pathname.startsWith(EMAIL_VERIFICATION_ROUTE_PREFIX) &&
    session?.userId
  ) {
    return NextResponse.redirect(new URL(getDefaultRouteForRole(session?.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
