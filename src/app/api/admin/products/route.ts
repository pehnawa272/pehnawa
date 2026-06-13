import { NextRequest, NextResponse } from "next/server";
import { ProductService } from "@/services/product.service";
import { CreateProductSchema, ProductFilterSchema } from "@/lib/validations/product";
import { successResponse, handleError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/admin/products — all products (all statuses) with filters
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const params  = Object.fromEntries(req.nextUrl.searchParams.entries());
    // Admin can see all statuses — if no status param, don't filter by status
    const filters = ProductFilterSchema.parse(params);
    const result  = await ProductService.list({ ...filters });
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/admin/products — create new product
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body    = await req.json();
    const input   = CreateProductSchema.parse(body);
    const product = await ProductService.create(input);
    return successResponse(product, 201);
  } catch (e) {
    return handleError(e);
  }
}
