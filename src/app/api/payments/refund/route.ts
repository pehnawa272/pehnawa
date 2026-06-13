/**
 * POST /api/payments/refund   [ADMIN]
 *
 * Marks a payment as refunded and re-credits any wallet amount used.
 * Wire up razorpay.payments.refund() here before going live.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, WalletTxReason } from "@/generated/client";
import { successResponse, handleError, NotFoundError, AppError } from "@/lib/errors";
import { WalletService } from "@/services/wallet.service";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { orderId, reason } = z.object({
      orderId: z.string().cuid(),
      reason:  z.string().min(3).max(300).optional(),
    }).parse(await req.json());

    const payment = await prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundError("Payment");
    if (payment.status !== PaymentStatus.PAID) {
      throw new AppError(`Cannot refund a payment with status "${payment.status}"`, 400, "INVALID_STATUS");
    }

    // TODO: call razorpay.payments.refund(payment.razorpayPaymentId!, { amount: payment.razorpayAmount })

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status:        PaymentStatus.REFUNDED,
          refundAmount:  payment.amount,
          refundReason:  reason ?? "Admin initiated refund",
          refundedAt:    new Date(),
        },
      });

      // Re-credit wallet portion back to customer
      if (payment.walletAmount > 0) {
        const order = await tx.order.findUnique({ where: { id: orderId } });
        if (order) {
          await WalletService.credit(
            order.userId,
            payment.walletAmount,
            WalletTxReason.ORDER_REFUND,
            `Wallet refund for order ${orderId}`,
            orderId
          );
        }
      }
    });

    return successResponse({ refunded: true, orderId, amount: payment.amount });
  } catch (e) {
    return handleError(e);
  }
}
