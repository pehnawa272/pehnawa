/**
 * Admin route guard — verifies the signed session cookie and ADMIN role.
 *
 * Usage in any admin API route:
 *
 *   const guard = await requireAdmin();
 *   if (guard instanceof NextResponse) return guard;  // 401 or 403
 *   // guard.user is the authenticated admin User row
 *
 * The session cookie is issued by POST /api/admin/login and is a stateless
 * HMAC-signed token (see src/lib/session.ts). This guard re-loads the user
 * from the DB on each call so role/soft-delete changes take effect immediately.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import type { User } from "@/generated/client";

interface AdminGuardSuccess {
  user: User;
}

export async function requireAdmin(): Promise<AdminGuardSuccess | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  const payload = verifySessionToken(token, Date.now());
  if (!payload) {
    return NextResponse.json(
      { success: false, error: { message: "Authentication required", code: "UNAUTHORIZED" } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payload.uid } });

  if (!user || user.deletedAt || user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: { message: "Forbidden: Admin role required", code: "FORBIDDEN" } },
      { status: 403 }
    );
  }

  return { user };
}
