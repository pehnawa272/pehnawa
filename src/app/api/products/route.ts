import { NextRequest } from "next/server";
import { ProductService } from "@/services/product.service";
import { ProductFilterSchema } from "@/lib/validations/product";
import { successResponse, handleError } from "@/lib/errors";

// GET /api/products — public catalog with filters + search + pagination
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const filters = ProductFilterSchema.parse(params);
    const result  = await ProductService.list(filters);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
