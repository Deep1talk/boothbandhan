import "server-only";

import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  createAuthToken,
  verifyAuthToken,
} from "@/lib/authToken";

export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return await verifyAuthToken(token);
}

export { AUTH_COOKIE_NAME, createAuthToken, verifyAuthToken };
