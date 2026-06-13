import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/services/wallet.service";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/wallet/transactions?page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { searchParams } = req.nextUrl;
    const { page, limit } = z.object({
      page:    z.coerce.number().int().positive().default(1),
      limit:   z.coerce.number().int().positive().max(50).default(20),
    }).parse(Object.fromEntries(searchParams.entries()));

    const result = await WalletService.getTransactions(clerkId, page, limit);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
