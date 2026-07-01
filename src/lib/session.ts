/**
 * Admin session — stateless, HMAC-SHA256 signed token stored in an httpOnly cookie.
 *
 * Token format (all base64url):   <payloadB64>.<signatureB64>
 * Payload JSON:                   { uid, role, exp }  (exp = unix ms)
 *
 * The signature is HMAC-SHA256(payloadB64, SESSION_SECRET). A tampered payload
 * or wrong secret fails verification. Expiry is checked on every read.
 *
 * Runs on the Node.js runtime (route handlers + proxy.ts in Next 16), so
 * node:crypto is available everywhere this is used.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "pehnawa_admin_session";
const MAX_AGE_MS = 1000 * 60 * 60 * 8; // 8 hours

export interface SessionPayload {
  uid: string;
  role: string;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or too short (need >= 32 chars). Set it in .env."
    );
  }
  return secret;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payloadB64: string): string {
  return b64url(createHmac("sha256", getSecret()).update(payloadB64).digest());
}

/** Create a signed token for a user. `nowMs` is injected so callers control time. */
export function createSessionToken(
  uid: string,
  role: string,
  nowMs: number
): { token: string; maxAgeSeconds: number } {
  const payload: SessionPayload = { uid, role, exp: nowMs + MAX_AGE_MS };
  const payloadB64 = b64url(Buffer.from(JSON.stringify(payload)));
  const token = `${payloadB64}.${sign(payloadB64)}`;
  return { token, maxAgeSeconds: Math.floor(MAX_AGE_MS / 1000) };
}

/** Verify signature + expiry. Returns the payload, or null if invalid/expired. */
export function verifySessionToken(
  token: string | undefined | null,
  nowMs: number
): SessionPayload | null {
  if (!token) return null;

  const dot = token.indexOf(".");
  if (dot <= 0) return null;

  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  const expectedSig = sign(payloadB64);
  const a = Buffer.from(sigB64);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof payload?.uid !== "string" ||
    typeof payload?.exp !== "number" ||
    payload.exp < nowMs
  ) {
    return null;
  }

  return payload;
}

/** Cookie options shared by login (set) and logout (clear). */
export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
