/**
 * POST /api/webhooks/razorpay
 *
 * Receives Razorpay webhook events:
 * - payment.captured (fallback order creation)
 * - payment.failed (log failure)
 * - refund.processed (mark payment REFUNDED and order CANCELLED)
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";
import { OrderService } from "@/services/order.service";
import { PendingOrderStore } from "@/lib/pending-order-store";
import { PaymentStatus, OrderStatus } from "@/generated/client";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const rawBody = await req.text();
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET env var is not set!");
      return NextResponse.json({ error: "Webhook secret configuration error" }, { status: 500 });
    }

    // Verify webhook signature in a timing-safe manner
    const expectedSignature = createHmac("sha256", secret).update(rawBody).digest("hex");
    
    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    
    let isSignatureValid = false;
    if (signatureBuffer.length === expectedBuffer.length) {
      try {
        const { timingSafeEqual } = await import("crypto");
        isSignatureValid = timingSafeEqual(signatureBuffer, expectedBuffer);
      } catch {
        isSignatureValid = expectedSignature === signature;
      }
    }

    if (!isSignatureValid) {
      console.warn("[Razorpay Webhook] Signature verification failed!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    console.log(`[Razorpay Webhook] Received event: ${event}`);

    if (event === "payment.captured") {
      const paymentEntity = body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (!razorpayOrderId) {
        console.warn("[Razorpay Webhook] payment.captured missing order_id. Skipping.");
        return NextResponse.json({ received: true });
      }

      // Check if order already exists
      const existingPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
      });

      if (existingPayment) {
        console.log(`[Razorpay Webhook] Order for razorpayOrderId ${razorpayOrderId} already exists. Skipping creation.`);
        await PendingOrderStore.delete(razorpayOrderId);
        return NextResponse.json({ received: true });
      }

      // Fallback: Create order using cached payload if not processed by client yet
      const pendingOrder = await PendingOrderStore.get(razorpayOrderId);
      if (pendingOrder) {
        console.log(`[Razorpay Webhook] Creating order from cache fallback for razorpayOrderId ${razorpayOrderId}`);
        await OrderService.createGuestOrder({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: "webhook_signature_verified",
          items:              pendingOrder.items,
          shippingForm:       pendingOrder.shippingForm,
          totalAmountInPaise: pendingOrder.totalAmountInPaise,
          subtotalAmountInPaise: pendingOrder.subtotalAmountInPaise,
          discountAmountInPaise: pendingOrder.discountAmountInPaise,
          couponCode:            pendingOrder.couponCode,
        });
        await PendingOrderStore.delete(razorpayOrderId);
      } else {
        console.log(`[Razorpay Webhook] No pending order found in cache for ${razorpayOrderId} (likely already processed by frontend verify).`);
      }
    } else if (event === "payment.failed") {
      const paymentEntity = body.payload.payment.entity;
      console.warn(`[Razorpay Webhook] Payment failed for Razorpay Payment ID: ${paymentEntity.id}, Order ID: ${paymentEntity.order_id}, Error description: ${paymentEntity.error_description || "N/A"}`);
    } else if (event === "refund.processed") {
      const refundEntity = body.payload.refund.entity;
      const razorpayPaymentId = refundEntity.payment_id;
      const refundId = refundEntity.id;
      const refundAmount = refundEntity.amount;

      const paymentRecord = await prisma.payment.findUnique({
        where: { razorpayPaymentId },
      });

      if (paymentRecord) {
        console.log(`[Razorpay Webhook] Processing refund for Payment ID ${razorpayPaymentId}`);
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: paymentRecord.id },
            data: {
              status:       PaymentStatus.REFUNDED,
              refundId,
              refundAmount,
              refundedAt:   new Date(),
              refundReason: refundEntity.notes?.reason || "Refund processed via Razorpay Dashboard",
            },
          });

          await tx.order.update({
            where: { id: paymentRecord.orderId },
            data: {
              status:             OrderStatus.CANCELLED,
              cancellationReason: `Refund of ₹${(refundAmount / 100).toFixed(2)} processed via Razorpay`,
              cancelledAt:        new Date(),
            },
          });
        });
      } else {
        console.warn(`[Razorpay Webhook] refund.processed payment record not found for Razorpay Payment ID: ${razorpayPaymentId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Razorpay Webhook] Exception occurred:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
