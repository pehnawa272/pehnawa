import { NextRequest, NextResponse } from "next/server";
import { CustomerService } from "@/services/customer.service";
import { UpdateCustomerSchema } from "@/lib/validations/customer";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/customers/me
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const user = await CustomerService.getByClerkId(clerkId);
    return successResponse(user);
  } catch (e) {
    return handleError(e);
  }
}

// PATCH /api/customers/me
export async function PATCH(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const body = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, ...rest } = z.object({ clerkId: z.string().min(1) })
      .merge(UpdateCustomerSchema)
      .parse(body);
    const user = await CustomerService.update(verifiedClerkId, rest);
    return successResponse(user);
  } catch (e) {
    return handleError(e);
  }
}
