import { NextRequest, NextResponse } from "next/server";
import { CartService } from "@/services/cart.service";
import { UpdateCartItemSchema } from "@/lib/validations/cart";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

type Params = { params: Promise<{ itemId: string }> };

// PATCH /api/cart/[itemId] — update quantity
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { itemId } = await params;
    const body       = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, quantity } = z.object({ clerkId: z.string().min(1) })
      .merge(UpdateCartItemSchema)
      .parse(body);
    const result = await CartService.updateItemQuantity(verifiedClerkId, itemId, quantity);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/cart/[itemId] — remove single item
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { itemId } = await params;
    const result = await CartService.removeItem(clerkId, itemId);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
