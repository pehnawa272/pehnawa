import { NextRequest, NextResponse } from "next/server";
import { ReferralService } from "@/services/referral.service";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// POST /api/referral/apply — apply a referral code at signup
export async function POST(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const body = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, code } = z.object({
      clerkId: z.string().min(1),
      code:    z.string().min(3).max(20).toUpperCase(),
    }).parse(body);
    const result = await ReferralService.applyCode(verifiedClerkId, code);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
