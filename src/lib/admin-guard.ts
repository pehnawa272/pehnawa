/**
 * Admin route guard — checks ADMIN role.
 *
 * Usage in any admin API route:
 *
 *   const guard = await requireAdmin(req);
 *   if (guard instanceof NextResponse) return guard;  // 403
 *   // guard.user is the authenticated User row
 *
 * Note: Clerk authentication has been removed. Set ADMIN_CLERK_ID in .env
 * to the clerkId of the admin user seeded in the database.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/client";

interface AdminGuardSuccess {
  user: User;
}

export async function requireAdmin(): Promise<AdminGuardSuccess | NextResponse> {
  // Use env var or fall back to seed placeholder for local dev
  const clerkId = process.env.ADMIN_CLERK_ID ?? "clerk_admin_placeholder";

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  return { user };
}
