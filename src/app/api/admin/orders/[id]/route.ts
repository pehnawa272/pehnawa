import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { UpdateOrderStatusSchema } from "@/lib/validations/order";
import { successResponse, handleError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/orders/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const order  = await OrderService.getById(id);
    return successResponse(order);
  } catch (e) {
    return handleError(e);
  }
}

// PATCH /api/admin/orders/[id] — update status and/or shipping tracking info
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body   = await req.json();
    const { status, trackingCode, shippingCarrier, trackingUrl, cancellationReason } =
      UpdateOrderStatusSchema.parse(body);
    const order  = await OrderService.updateStatus(id, status, {
      trackingCode, shippingCarrier, trackingUrl, cancellationReason,
    });
    return successResponse(order);
  } catch (e) {
    return handleError(e);
  }
}
