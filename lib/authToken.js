import { jwtVerify, SignJWT } from "jose";

export const AUTH_COOKIE_NAME = "auth_token";

const authSecret = process.env.AUTH_SECRET || process.env.SECRET_KEY;

if (!authSecret) {
  throw new Error("AUTH_SECRET or SECRET_KEY must be set");
}

const secretKey = new TextEncoder().encode(authSecret);

export async function createAuthToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAuthToken(token) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}
