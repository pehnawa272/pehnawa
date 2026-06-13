import { NextRequest, NextResponse } from "next/server";
import { ReferralService } from "@/services/referral.service";
import { successResponse, handleError } from "@/lib/errors";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/referral — read-only: fetch existing referral code + usage stats
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const code = await ReferralService.getByClerkId(clerkId);
    return successResponse(code);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/referral — create referral code if it doesn't exist (safe mutation)
export async function POST(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const code = await ReferralService.getOrCreateCode(clerkId);
    return successResponse(code, 201);
  } catch (e) {
    return handleError(e);
  }
}
