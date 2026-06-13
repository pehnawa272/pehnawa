import { NextRequest, NextResponse } from "next/server";
import { MeasurementService } from "@/services/measurement.service";
import { CreateMeasurementSchema } from "@/lib/validations/measurement";
import { successResponse, handleError } from "@/lib/errors";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";

// GET /api/measurements
export async function GET(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const profiles = await MeasurementService.listByClerkId(clerkId);
    return successResponse(profiles);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/measurements
export async function POST(req: NextRequest) {
  try {
    const authGuard = await requireAuth();
    if (authGuard instanceof NextResponse) return authGuard;
    const { clerkId } = authGuard;

    const body    = await req.json();
    body.clerkId = clerkId;

    const { clerkId: verifiedClerkId, ...rest } = z.object({ clerkId: z.string().min(1) })
      .merge(CreateMeasurementSchema)
      .parse(body);
    const profile = await MeasurementService.create(verifiedClerkId, rest);
    return successResponse(profile, 201);
  } catch (e) {
    return handleError(e);
  }
}
