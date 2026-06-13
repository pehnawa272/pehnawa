import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { UpdateProductSchema, AddProductImageSchema, ReorderImagesSchema, AddProductVideoSchema } from "@/lib/validations/product";
import { successResponse, handleError, AppError } from "@/lib/errors";
import { ProductStatus } from "@/generated/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/products/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id }  = await params;
    const product = await ProductService.getById(id);
    return successResponse(product);
  } catch (e) {
    return handleError(e);
  }
}

// PATCH /api/admin/products/[id]
// ?action=publish | archive | restore | add-image | remove-image | reorder-images | add-video | remove-video
// No action = full field update
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const action = req.nextUrl.searchParams.get("action");

    if (action === "publish") {
      return successResponse(await ProductService.setStatus(id, ProductStatus.PUBLISHED));
    }
    if (action === "archive") {
      return successResponse(await ProductService.setStatus(id, ProductStatus.ARCHIVED));
    }
    if (action === "restore") {
      return successResponse(await ProductService.restore(id));
    }
    if (action === "add-image") {
      const body  = await req.json();
      const input = AddProductImageSchema.parse(body);
      return successResponse(await ProductService.addImage(id, input), 201);
    }
    if (action === "remove-image") {
      const { imageId } = z.object({ imageId: z.string().cuid() }).parse(await req.json());
      return successResponse(await ProductService.removeImage(imageId));
    }
    if (action === "reorder-images") {
      const { order } = ReorderImagesSchema.parse(await req.json());
      return successResponse(await ProductService.reorderImages(id, order));
    }
    if (action === "add-video") {
      const body  = await req.json();
      const input = AddProductVideoSchema.parse(body);
      return successResponse(await ProductService.addVideo(id, input), 201);
    }
    if (action === "remove-video") {
      const { videoId } = z.object({ videoId: z.string().cuid() }).parse(await req.json());
      return successResponse(await ProductService.removeVideo(videoId));
    }

    // Default: full update
    const body    = await req.json();
    const input   = UpdateProductSchema.parse(body);
    const product = await ProductService.update(id, input);
    return successResponse(product);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/admin/products/[id] — soft delete
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const result = await ProductService.softDelete(id);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
