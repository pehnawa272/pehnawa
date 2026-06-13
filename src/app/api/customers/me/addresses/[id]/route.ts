import { NextRequest, NextResponse } from "next/server";
import { CustomerService } from "@/services/customer.service";
import { UpdateAddressSchema } from "@/lib/validations/customer";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/customers/me/addresses/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { id } = await params;
    const body   = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, ...rest } = z.object({ clerkId: z.string().min(1) })
      .merge(UpdateAddressSchema)
      .parse(body);
    const address = await CustomerService.updateAddress(id, verifiedClerkId, rest);
    return successResponse(address);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/customers/me/addresses/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { id } = await params;
    const result = await CustomerService.deleteAddress(id, clerkId);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
