import { NextRequest, NextResponse } from "next/server";
import { WishlistService } from "@/services/wishlist.service";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/wishlist
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const wishlist = await WishlistService.getByClerkId(clerkId);
    return successResponse(wishlist);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/wishlist — add product
export async function POST(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const body = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, productId } = z.object({
      clerkId:   z.string().min(1),
      productId: z.string().cuid(),
    }).parse(body);
    const item = await WishlistService.addProduct(verifiedClerkId, productId);
    return successResponse(item, 201);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/wishlist
export async function DELETE(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { searchParams } = req.nextUrl;
    const { productId } = z.object({
      productId: z.string().cuid(),
    }).parse({
      productId: searchParams.get("productId"),
    });
    const result = await WishlistService.removeProduct(clerkId, productId);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
