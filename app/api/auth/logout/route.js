import { NextResponse } from "next/server";
import { successResponse } from "@/lib/helper";
import { AUTH_COOKIE_NAME } from "@/lib/session";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";

export async function POST() {
  const response = successResponse(200, "Logout successful");
  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}

export async function GET(req) {
  const loginUrl = new URL(WEBSITE_LOGIN, req.url);

  if (req.nextUrl.searchParams.get("reason") === "locked") {
    loginUrl.searchParams.set("reason", "locked");
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
