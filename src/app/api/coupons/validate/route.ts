import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleError, AppError } from "@/lib/errors";
import { z } from "zod";

const ValidateCouponSchema = z.object({
  code: z.string().min(1).transform(val => val.trim().toUpperCase()),
  cartSubtotal: z.number().positive(), // subtotal in rupees from client
  email: z.string().email().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, cartSubtotal, email } = ValidateCouponSchema.parse(body);

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new AppError("Invalid coupon code", 400);
    }

    if (!coupon.isActive) {
      throw new AppError("This coupon code is no longer active", 400);
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() <= Date.now()) {
      throw new AppError("This coupon has expired", 400);
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      throw new AppError("This coupon has reached its usage limit", 400);
    }

    // Check if this email address has already successfully used this coupon
    if (email) {
      const previousOrder = await prisma.order.findFirst({
        where: {
          user: { email: { equals: email.trim(), mode: "insensitive" } },
          couponId: coupon.id,
          payment: { status: "PAID" },
        },
      });
      if (previousOrder) {
        throw new AppError("This coupon has already been used", 400);
      }
    }

    // Convert subtotal to paise for comparison
    const subtotalInPaise = Math.round(cartSubtotal * 100);

    if (subtotalInPaise < coupon.minOrderValue) {
      const minValInRupees = coupon.minOrderValue / 100;
      throw new AppError(`Minimum order value is ₹${minValInRupees.toLocaleString("en-IN")}`, 400);
    }

    // Calculate discount amount in paise
    const discountAmount = Math.round(subtotalInPaise * (coupon.discountPercent / 100));

    return successResponse({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmountInPaise: discountAmount,
      discountAmountInRupees: discountAmount / 100,
    });
  } catch (e) {
    return handleError(e);
  }
}
