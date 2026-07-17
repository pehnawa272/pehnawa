import { NextRequest, NextResponse } from "next/server";
import { ConsultationService } from "@/services/consultation.service";
import { CreateConsultationSchema } from "@/lib/validations/consultation";
import { successResponse, handleError } from "@/lib/errors";
import { ConsultationStatus } from "@/generated/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";

import { checkRateLimit } from "@/lib/ratelimit";
import { AppError } from "@/lib/errors";

// GET /api/consultations?status=&page=&limit= [ADMIN]
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = req.nextUrl;
    const { status, page, limit } = z.object({
      status: z.nativeEnum(ConsultationStatus).optional(),
      page:   z.coerce.number().int().positive().default(1),
      limit:  z.coerce.number().int().positive().max(500).default(20),
    }).parse(Object.fromEntries(searchParams.entries()));

    const result = await ConsultationService.list(page, limit, status);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/consultations — public: create consultation request
export async function POST(req: NextRequest) {
  try {
    // Check rate limit: 3 requests per 10 minutes
    const limitRes = await checkRateLimit(req, "consultations", { requests: 3, duration: "10 m" });
    if (!limitRes.success) {
      throw new AppError("Too many requests, please try again in a moment", 429);
    }

    const body         = await req.json();
    const input        = CreateConsultationSchema.parse(body);
    const consultation = await ConsultationService.create(input);
    return successResponse(consultation, 201);
  } catch (e) {
    return handleError(e);
  }
}
