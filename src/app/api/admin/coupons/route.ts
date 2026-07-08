import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleError, AppError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";
import { z } from "zod";

const CreateCouponSchema = z.object({
  code: z.string().min(1).max(50).transform(val => val.trim().toUpperCase()),
  discountPercent: z.number().int().min(1).max(100),
  minOrderValue: z.number().min(0), // in rupees from UI, will convert to paise in database
  maxUses: z.number().int().min(0).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : null),
  isActive: z.boolean().default(true),
});

// GET /api/admin/coupons - list all coupons
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ items: coupons });
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/admin/coupons - create a new coupon
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();
    const input = CreateCouponSchema.parse(body);

    // Check if code is unique (case-insensitive check)
    const existing = await prisma.coupon.findUnique({
      where: { code: input.code },
    });

    if (existing) {
      throw new AppError(`Coupon code "${input.code}" already exists`, 400);
    }

    if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
      throw new AppError("Expiration date must be in the future", 400);
    }

    // Convert minOrderValue from rupees to paise
    const minOrderValueInPaise = Math.round(input.minOrderValue * 100);

    const coupon = await prisma.coupon.create({
      data: {
        code: input.code,
        discountPercent: input.discountPercent,
        minOrderValue: minOrderValueInPaise,
        maxUses: input.maxUses || null,
        expiresAt: input.expiresAt || null,
        isActive: input.isActive,
      },
    });

    return successResponse(coupon, 201);
  } catch (e) {
    return handleError(e);
  }
}
