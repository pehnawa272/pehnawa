import { NextRequest, NextResponse } from "next/server";
import { ConsultationService } from "@/services/consultation.service";
import { UpdateConsultationSchema } from "@/lib/validations/consultation";
import { successResponse, handleError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";

type Params = { params: Promise<{ id: string }> };

// GET /api/consultations/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id }       = await params;
    const consultation = await ConsultationService.getById(id);
    return successResponse(consultation);
  } catch (e) {
    return handleError(e);
  }
}

// PATCH /api/consultations/[id] [ADMIN]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body   = await req.json();
    const input  = UpdateConsultationSchema.parse(body);
    const result = await ConsultationService.update(id, input);
    return successResponse(result);
  } catch (e) {
    return handleError(e);
  }
}
