import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Combined proxy: CSP nonce generation + admin auth gate.
 *
 * 1. Generates a per-request cryptographic nonce and builds a strict
 *    Content-Security-Policy header that uses 'strict-dynamic' + the nonce.
 *    Next.js automatically reads the nonce from the CSP header and applies
 *    it to all framework scripts, hydration scripts, and inline styles.
 *
 * 2. Gates admin sub-pages (/admin/orders, etc.) behind a valid session
 *    cookie. The login page at /admin itself is always allowed through.
 *
 * IMPORTANT (Next.js 16+): this file MUST be named proxy.ts and MUST export
 * a function named `proxy`. middleware.ts is the deprecated ≤15 convention.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── 1. Admin auth gate ──────────────────────────────────────────────
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

  // ─── 2. CSP nonce generation ─────────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Build the Content-Security-Policy header with the per-request nonce.
  // - 'strict-dynamic' trusts scripts loaded by a nonced script, so
  //   third-party SDKs loaded by Next.js bundles work automatically.
  // - 'unsafe-inline' is kept as a fallback for older browsers that don't
  //   support strict-dynamic; modern browsers ignore it when strict-dynamic
  //   is present.
  // - 'unsafe-eval' is included only in development (React uses eval for
  //   enhanced error stacks in dev mode).
  const cspHeader = [
    "default-src 'self';",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com https://va.vercel-insights.com;`,
    `style-src 'self' 'unsafe-inline';`,
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com;",
    "connect-src 'self' ws: wss: https://api.razorpay.com https://va.vercel-insights.com;",
    "frame-src 'self' https://checkout.razorpay.com;",
    "frame-ancestors 'none';",
    "font-src 'self';",
    "media-src 'self' https://res.cloudinary.com;",
    "object-src 'none';",
    "base-uri 'self';",
    "form-action 'self';",
  ].join(" ");

  // Set the nonce on request headers so Server Components can read it
  // via headers().get("x-nonce"). Next.js also reads x-nonce internally
  // and attaches the nonce attribute to all hydration <script> tags.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP + other security headers on the outgoing response.
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    // Admin page routes (for auth gating)
    "/admin/:path*",
    // All page routes except Next.js internals, static files, and prefetches.
    // API routes are excluded — they don't serve HTML, so CSP is irrelevant.
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|webmanifest)).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
