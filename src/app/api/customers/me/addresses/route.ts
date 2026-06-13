import { NextRequest, NextResponse } from "next/server";
import { CustomerService } from "@/services/customer.service";
import { CreateAddressSchema } from "@/lib/validations/customer";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// POST /api/customers/me/addresses
export async function POST(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const body = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, ...rest } = z.object({ clerkId: z.string().min(1) })
      .merge(CreateAddressSchema)
      .parse(body);
    const address = await CustomerService.addAddress(verifiedClerkId, rest);
    return successResponse(address, 201);
  } catch (e) {
    return handleError(e);
  }
}
