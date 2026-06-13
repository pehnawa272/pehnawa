import { NextRequest, NextResponse } from "next/server";
import { ReferralService } from "@/services/referral.service";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

// POST /api/referral/reward — [ADMIN/INTERNAL] trigger referrer bonus after first order delivered
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();
    const { referredUserId, orderId } = z.object({
      referredUserId: z.string().cuid(),
      orderId:        z.string().cuid(),
    }).parse(body);
    const result = await ReferralService.approveReferrerReward(referredUserId, orderId);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
