import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/services/wallet.service";
import { CreditWalletSchema } from "@/lib/validations/wallet";
import { WalletTxReason } from "@/generated/client";
import { successResponse, handleError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResponse } from "@/lib/pagination";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/admin/wallets?page=&limit=
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = req.nextUrl;
    const { page, limit }  = z.object({
      page:  z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
    }).parse(Object.fromEntries(searchParams.entries()));

    const skip  = (page - 1) * limit;
    const [wallets, total] = await Promise.all([
      prisma.wallet.findMany({
        include: {
          user:   { select: { id: true, name: true, email: true } },
          _count: { select: { transactions: true } },
        },
        orderBy: { balance: "desc" },
        skip,
        take: limit,
      }),
      prisma.wallet.count(),
    ]);

    return successResponse(buildPaginatedResponse(wallets, total, { page, limit, skip }));
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/admin/wallets — manually credit a wallet
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body  = await req.json();
    const input = CreditWalletSchema.parse(body);
    const txn   = await WalletService.credit(
      input.userId,
      input.amount,
      WalletTxReason.ADMIN_CREDIT,
      input.description ?? "Admin credit"
    );
    return successResponse(txn, 201);
  } catch (e) {
    return handleError(e);
  }
}
