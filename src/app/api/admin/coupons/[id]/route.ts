import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleError, AppError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";
import { z } from "zod";

const UpdateCouponSchema = z.object({
  code: z.string().min(1).max(50).transform(val => val.trim().toUpperCase()).optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  minOrderValue: z.number().min(0).optional(), // in rupees
  maxUses: z.number().int().min(0).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : null),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/coupons/[id] - update a coupon
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();
    const input = UpdateCouponSchema.parse(body);

    // Verify coupon exists
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }

    const updateData: any = {};
    if (input.code !== undefined) {
      // Ensure new code is unique
      const existing = await prisma.coupon.findFirst({
        where: { code: input.code, NOT: { id } },
      });
      if (existing) {
        throw new AppError(`Coupon code "${input.code}" already exists`, 400);
      }
      updateData.code = input.code;
    }
    if (input.discountPercent !== undefined) {
      updateData.discountPercent = input.discountPercent;
    }
    if (input.minOrderValue !== undefined) {
      updateData.minOrderValue = Math.round(input.minOrderValue * 100); // rupees to paise
    }
    if (input.maxUses !== undefined) {
      updateData.maxUses = input.maxUses;
    }
    if (input.expiresAt !== undefined) {
      if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
        throw new AppError("Expiration date must be in the future", 400);
      }
      updateData.expiresAt = input.expiresAt;
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updatedCoupon);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/admin/coupons/[id] - delete a coupon
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }

    await prisma.coupon.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
