import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/session";
import { successResponse, errorResponse, handleError } from "@/lib/errors";

// The login form sends username "admin"; map it to the admin user's email.
// Configurable via ADMIN_LOGIN_EMAIL for future flexibility.
const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL ?? "admin@pehnawa.com").trim();

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

import { checkRateLimit } from "@/lib/ratelimit";

// POST /api/admin/login  — verify credentials, set signed httpOnly session cookie
export async function POST(req: NextRequest) {
  try {
    // Check rate limit: 5 attempts per 15 minutes
    const limitRes = await checkRateLimit(req, "admin-login", { requests: 5, duration: "15 m" });
    if (!limitRes.success) {
      return errorResponse("Too many requests, please try again in a moment", 429, "RATE_LIMIT_EXCEEDED");
    }

    const body = await req.json().catch(() => null);
    const { username, password } = loginSchema.parse(body);

    // Resolve the username to an email (only "admin" is accepted today).
    const email = username.toLowerCase() === ADMIN_USERNAME ? ADMIN_EMAIL : null;

    // Generic failure message + always run a hash compare to blunt user enumeration.
    const invalid = () =>
      errorResponse("Invalid credentials.", 401, "INVALID_CREDENTIALS");

    const user = email
      ? await prisma.user.findUnique({ where: { email } })
      : null;

    const ok =
      !!user &&
      user.role === "ADMIN" &&
      !user.deletedAt &&
      (await verifyPassword(password, user.passwordHash));

    if (!ok || !user) {
      // Burn some time even on unknown user to keep timing uniform.
      if (!user) await verifyPassword(password, null);
      return invalid();
    }

    const now = Date.now();
    const { token, maxAgeSeconds } = createSessionToken(user.id, user.role, now);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(maxAgeSeconds));

    return successResponse({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    return handleError(e);
  }
}
