import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Edge-of-app gate. Real authorization lives in requireAdmin() on every
 * /api/admin/* route; this adds a server-side page gate so admin sub-pages
 * aren't even served to unauthenticated visitors.
 *
 * The login form is rendered at /admin itself (AdminAuthWrapper), so /admin is
 * always allowed through. Deeper links (/admin/orders, …) require a valid
 * session cookie, otherwise we redirect back to /admin to sign in.
 *
 * IMPORTANT (Next.js 16+): this file MUST be named proxy.ts and MUST export
 * a function named `proxy` (or a default export) — Next.js only auto-invokes
 * it if both match. middleware.ts / export function middleware() is the
 * deprecated ≤15 convention; using it in Next 16 either throws a build error
 * or silently does nothing, depending on version specifics. Don't revert this.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Gate admin *sub-pages* only; /admin hosts the login UI itself.
  if (pathname.startsWith("/admin/") && pathname !== "/admin") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const payload = verifySessionToken(token, Date.now());
    if (!payload) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
