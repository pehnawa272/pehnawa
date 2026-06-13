import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import { CreateOrderSchema } from "@/lib/validations/order";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { searchParams } = req.nextUrl;
    const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10", 10));
    const result = await OrderService.listByClerkId(clerkId, page, limit);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/orders — create order
export async function POST(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const body  = await req.json();
    body.clerkId = clerkId;

    const input = CreateOrderSchema.parse(body);
    const order = await OrderService.create(input);
    return successResponse(order, 201);
  } catch (e) {
    return handleError(e);
  }
}
