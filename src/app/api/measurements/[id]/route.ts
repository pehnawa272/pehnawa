import { NextRequest, NextResponse } from "next/server";
import { MeasurementService } from "@/services/measurement.service";
import { UpdateMeasurementSchema } from "@/lib/validations/measurement";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/measurements/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { id } = await params;
    const body   = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, ...rest } = z.object({ clerkId: z.string().min(1) })
      .merge(UpdateMeasurementSchema)
      .parse(body);
    const profile = await MeasurementService.update(id, verifiedClerkId, rest);
    return successResponse(profile);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/measurements/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const { id } = await params;
    const result = await MeasurementService.delete(id, clerkId);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
