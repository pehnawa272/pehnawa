import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, handleError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

// Validation schema for review updates
const UpdateReviewSchema = z.object({
  customerName: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  text: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  isApproved: z.boolean().optional(),
  isVerifiedPurchase: z.boolean().optional(),
});

// PATCH /api/admin/reviews/[id] — update a review (approve/reject, edit fields)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body = await req.json();
    const input = UpdateReviewSchema.parse(body);

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: "Review not found" } },
        { status: 404 }
      );
    }

    const updated = await prisma.review.update({
      where: { id },
      data: input,
    });

    return successResponse(updated);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/admin/reviews/[id] — delete a review
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;

    const review = await prisma.review.delete({
      where: { id },
    });

    return successResponse({ id: review.id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
