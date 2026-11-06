import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

export type SessionPayload = {
  userId: string;
  expiresAt: string;
};

// Read the secret lazily so a missing SESSION_SECRET does not break `next build`.
function getKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET;
  return secret ? new TextEncoder().encode(secret) : null;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  const key = getKey();
  if (!key) {
    throw new Error("SESSION_SECRET is not set. Add it to .env.local (see .env.example).");
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key);
}

// Returns the payload only if the signature is valid and the token has not expired.
// Anything else (missing cookie, tampered value, wrong secret) counts as logged out.
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  const key = getKey();
  if (!token || !key) return null;

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId, expiresAt: expires.toISOString() });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
