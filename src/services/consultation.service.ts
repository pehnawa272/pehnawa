import { prisma } from "@/lib/prisma";
import { ConsultationStatus, Prisma } from "@/generated/client";
import { NotFoundError } from "@/lib/errors";
import { buildPaginatedResponse } from "@/lib/pagination";
import type { CreateConsultationInput, UpdateConsultationInput } from "@/lib/validations/consultation";

export const ConsultationService = {

  async create(input: CreateConsultationInput) {
    const { clerkId, requestedDate, ...rest } = input;

    let userId: string | null = null;
    if (clerkId) {
      const user = await prisma.user.findUnique({ where: { clerkId } });
      userId = user?.id ?? null;
    }

    return prisma.consultationRequest.create({
      data: {
        ...rest,
        userId,
        requestedDate: requestedDate ? new Date(requestedDate) : null,
      },
    });
  },

  async list(page: number, limit: number, status?: ConsultationStatus) {
    const skip  = (page - 1) * limit;
    const where: Prisma.ConsultationRequestWhereInput = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.consultationRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.consultationRequest.count({ where }),
    ]);

    return buildPaginatedResponse(items, total, { page, limit, skip });
  },

  async getById(id: string) {
    const consultation = await prisma.consultationRequest.findUnique({
      where:   { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!consultation) throw new NotFoundError("Consultation");
    return consultation;
  },

  async update(id: string, input: UpdateConsultationInput) {
    await ConsultationService.getById(id);

    const { scheduledAt, ...rest } = input;

    return prisma.consultationRequest.update({
      where: { id },
      data: {
        ...rest,
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt) } : {}),
      },
    });
  },
};
