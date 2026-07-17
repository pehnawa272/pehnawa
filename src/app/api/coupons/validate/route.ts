import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleError, AppError } from "@/lib/errors";
import { z } from "zod";
import { checkRateLimit } from "@/lib/ratelimit";

const ValidateCouponSchema = z.object({
  code: z.string().min(1).transform(val => val.trim().toUpperCase()),
  cartSubtotal: z.number().positive(), // subtotal in rupees from client
  email: z.string().email().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Check rate limit: 10 requests per minute (60 seconds)
    const limitRes = await checkRateLimit(req, "coupons-validate", { requests: 10, duration: "60 s" });
    if (!limitRes.success) {
      throw new AppError("Too many requests, please try again in a moment", 429);
    }

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

    // Check if this email address has reached the maximum permitted uses of this coupon
    if (email && coupon.maxUses !== null) {
      const usageCount = await prisma.order.count({
        where: {
          user: { email: { equals: email.trim(), mode: "insensitive" } },
          couponId: coupon.id,
          payment: { status: "PAID" },
        },
      });
      if (usageCount >= coupon.maxUses) {
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
