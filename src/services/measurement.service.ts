import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { CreateMeasurementInput, UpdateMeasurementInput } from "@/lib/validations/measurement";

export const MeasurementService = {

  async listByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    return prisma.measurementProfile.findMany({
      where:   { userId: user.id, deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  async create(clerkId: string, data: CreateMeasurementInput) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.measurementProfile.updateMany({
          where: { userId: user.id, isDefault: true },
          data:  { isDefault: false },
        });
      }
      return tx.measurementProfile.create({
        data: { userId: user.id, ...data },
      });
    });
  },

  async update(id: string, clerkId: string, data: UpdateMeasurementInput) {
    const user    = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const profile = await prisma.measurementProfile.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!profile) throw new NotFoundError("Measurement profile");

    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.measurementProfile.updateMany({
          where: { userId: user.id, isDefault: true },
          data:  { isDefault: false },
        });
      }
      return tx.measurementProfile.update({ where: { id }, data });
    });
  },

  async delete(id: string, clerkId: string) {
    const user    = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const profile = await prisma.measurementProfile.findFirst({
      where: { id, userId: user.id, deletedAt: null },
    });
    if (!profile) throw new NotFoundError("Measurement profile");

    return prisma.measurementProfile.update({
      where: { id },
      data:  { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });
  },
};
