import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/services/wallet.service";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/wallet
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const wallet = await WalletService.getByClerkId(clerkId);
    return successResponse(wallet);
  } catch (e) {
    return handleError(e);
  }
}
