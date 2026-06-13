import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";
import type { UpdateCustomerInput, CreateAddressInput } from "@/lib/validations/customer";

export const CustomerService = {

  async getByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({
      where: { clerkId, deletedAt: null },
      select: {
        id: true, clerkId: true, name: true, email: true,
        phone: true, avatarUrl: true, role: true, createdAt: true,
        addresses: { where: { deletedAt: null }, orderBy: { isDefault: "desc" } },
        wallet:    { select: { balance: true } },
        referralCode: { select: { code: true, usesCount: true } },
        _count: { select: { orders: true } },
      },
    });
    if (!user) throw new NotFoundError("User");
    return user;
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true, clerkId: true, name: true, email: true,
        phone: true, avatarUrl: true, role: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundError("User");
    return user;
  },

  async update(clerkId: string, data: UpdateCustomerInput) {
    await CustomerService.getByClerkId(clerkId);
    return prisma.user.update({
      where: { clerkId },
      data,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });
  },

  // ── Addresses ──────────────────────────────────────────────────────────────

  async addAddress(clerkId: string, data: CreateAddressInput) {
    const user = await CustomerService.getByClerkId(clerkId);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data:  { isDefault: false },
      });
    }

    return prisma.address.create({
      data: { userId: user.id, ...data },
    });
  },

  async updateAddress(addressId: string, clerkId: string, data: Partial<CreateAddressInput>) {
    const user    = await CustomerService.getByClerkId(clerkId);
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id, deletedAt: null },
    });
    if (!address) throw new NotFoundError("Address");

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data:  { isDefault: false },
      });
    }

    return prisma.address.update({ where: { id: addressId }, data });
  },

  async deleteAddress(addressId: string, clerkId: string) {
    const user    = await CustomerService.getByClerkId(clerkId);
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id, deletedAt: null },
    });
    if (!address) throw new NotFoundError("Address");
    return prisma.address.update({
      where: { id: addressId },
      data:  { deletedAt: new Date() },
    });
  },
};
