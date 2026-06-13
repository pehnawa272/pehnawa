import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/services/cart.service";
import { AddToCartSchema, UpdateCartItemSchema } from "@/lib/validations/cart";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/cart
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const cart = await CartService.getByClerkId(clerkId);
    return successResponse(cart);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/cart — add item
export async function POST(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const body    = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, ...rest } = z.object({ clerkId: z.string().min(1) })
      .merge(AddToCartSchema)
      .parse(body);
    const item = await CartService.addItem(verifiedClerkId, rest);
    return successResponse(item, 201);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/cart — clear entire cart
export async function DELETE(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const result = await CartService.clear(clerkId);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
