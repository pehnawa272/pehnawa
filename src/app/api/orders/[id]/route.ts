import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { CancelOrderSchema } from "@/lib/validations/order";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

type Params = { params: Promise<{ id: string }> };

// GET /api/orders/[id]
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { id } = await params;
    const order   = await OrderService.getById(id, clerkId);
    return successResponse(order);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/orders/[id] — customer cancel
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { id } = await params;
    const body   = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, reason } = z.object({ clerkId: z.string().min(1) })
      .merge(CancelOrderSchema)
      .parse(body);
    const order = await OrderService.cancel(id, verifiedClerkId, reason);
    return successResponse(order);
  } catch (e) {
    return handleError(e);
  }
}
