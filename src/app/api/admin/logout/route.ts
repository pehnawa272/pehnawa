import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { successResponse, handleError } from "@/lib/errors";

// POST /api/admin/logout — clear the session cookie
export async function POST() {
  try {
    const cookieStore = await cookies();
    // Overwrite with an immediately-expired cookie.
    cookieStore.set(SESSION_COOKIE, "", sessionCookieOptions(0));
    return successResponse({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
