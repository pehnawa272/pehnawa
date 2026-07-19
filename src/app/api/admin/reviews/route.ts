import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";
import { z } from "zod";

// Validation schema for manually-seeded reviews
const CreateReviewSchema = z.object({
  productId: z.string().min(1),
  orderId: z.string().nullable().optional(), // null for manual seeds
  customerName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1),
  images: z.array(z.string()).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isVerifiedPurchase: z.boolean().optional(),
  isApproved: z.boolean().optional(),
});

// GET /api/admin/reviews — list all reviews (approved + pending)
// Optional query params: ?productId=xxx&isApproved=true|false
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const isApprovedParam = searchParams.get("isApproved");

    const where: Record<string, unknown> = {};
    if (productId) {
      where.productId = productId;
    }
    if (isApprovedParam === "true") {
      where.isApproved = true;
    } else if (isApprovedParam === "false") {
      where.isApproved = false;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(reviews);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/admin/reviews — create a manually-seeded review
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();
    const input = CreateReviewSchema.parse(body);

    const review = await prisma.review.create({
      data: {
        productId: input.productId,
        orderId: input.orderId ?? null,
        customerName: input.customerName,
        rating: input.rating,
        text: input.text,
        images: input.images ?? [],
        isVerifiedPurchase: input.isVerifiedPurchase ?? false,
        isApproved: input.isApproved ?? true, // manual seeds are approved by default
      },
    });

    return successResponse(review, 201);
  } catch (e) {
    return handleError(e);
  }
}
