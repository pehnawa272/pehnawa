import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/client";

interface AuthGuardSuccess {
  user: User;
  clerkId: string;
}

/**
 * Auth guard — looks up a user by clerkId query param (dev mode only).
 * In production this would validate a session cookie/token.
 */
export async function requireAuth(): Promise<AuthGuardSuccess | NextResponse> {
  // Fallback: use a placeholder clerkId for dev
  const clerkId = "clerk_customer_placeholder";

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    return NextResponse.json(
      { error: `User profile with clerkId "${clerkId}" not found in database. Did you run the seed script?` },
      { status: 404 }
    );
  }

  return { user, clerkId };
}
