import { NextRequest } from "next/server";
import { ProductService } from "@/services/product.service";
import { successResponse, handleError } from "@/lib/errors";

type Params = { params: Promise<{ slug: string }> };

// GET /api/products/[slug] — public product detail
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const product  = await ProductService.getBySlug(slug);
    return successResponse(product);
  } catch (e) {
    return handleError(e);
  }
}
