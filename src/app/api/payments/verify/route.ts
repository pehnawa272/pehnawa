/**
 * POST /api/payments/verify
 *
 * Verifies Razorpay HMAC signature after client-side checkout success.
 * Creates the order in the database from the cached checkout payload.
 */

import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { OrderService } from "@/services/order.service";
import { PendingOrderStore } from "@/lib/pending-order-store";
import { successResponse, handleError, AppError } from "@/lib/errors";
import { z } from "zod";

const VerifyPayloadSchema = z.object({
  razorpayOrderId:   z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = VerifyPayloadSchema.parse(body);

    // 1. Verify HMAC-SHA256 signature in a timing-safe manner
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated = createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpaySignature, "utf8");
    const generatedBuffer = Buffer.from(generated, "utf8");

    let isSignatureValid = false;
    if (signatureBuffer.length === generatedBuffer.length) {
      try {
        const { timingSafeEqual } = await import("crypto");
        isSignatureValid = timingSafeEqual(signatureBuffer, generatedBuffer);
      } catch {
        isSignatureValid = generated === razorpaySignature;
      }
    }

    if (!isSignatureValid) {
      throw new AppError("Payment signature verification failed", 400, "INVALID_SIGNATURE");
    }

    // 2. Prevent duplicate order creation
    const existingPayment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: { order: true },
    });

    if (existingPayment) {
      // Order has already been created (e.g. by webhook or concurrent client request)
      // Clean up cache just in case
      await PendingOrderStore.delete(razorpayOrderId);
      return successResponse({ verified: true, order: existingPayment.order });
    }

    // 3. Retrieve pending order details from the cache
    const pendingOrder = await PendingOrderStore.get(razorpayOrderId);
    if (!pendingOrder) {
      throw new AppError("Pending order details not found or expired", 404);
    }

    // 4. Create Order, Address, User, Payment in a transaction
    const order = await OrderService.createGuestOrder({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items:              pendingOrder.items,
      shippingForm:       pendingOrder.shippingForm,
      totalAmountInPaise: pendingOrder.totalAmountInPaise,
    });

    // 5. Delete cached pending order details
    await PendingOrderStore.delete(razorpayOrderId);

    return successResponse({ verified: true, order });
  } catch (e) {
    console.error("[/api/payments/verify ERROR]", e);
    return handleError(e);
  }
}
