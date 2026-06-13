import { prisma } from "@/lib/prisma";
import { WalletTxType, WalletTxReason } from "@/generated/client";
import { NotFoundError, AppError } from "@/lib/errors";
import { buildPaginatedResponse } from "@/lib/pagination";

export const WalletService = {

  async getByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const wallet = await prisma.wallet.findUnique({
      where:  { userId: user.id },
      select: { id: true, balance: true, userId: true, updatedAt: true },
    });

    // Return a default empty wallet if one doesn't exist yet
    if (!wallet) {
      return {
        id:        "",
        balance:   0,
        userId:    user.id,
        updatedAt: new Date(),
      };
    }

    return wallet;
  },

  async getTransactions(clerkId: string, page: number, limit: number) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return buildPaginatedResponse([], 0, { page, limit, skip: 0 });

    const skip  = (page - 1) * limit;
    const where = { walletId: wallet.id };

    const [txns, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return buildPaginatedResponse(txns, total, { page, limit, skip });
  },

  async credit(userId: string, amount: number, reason: WalletTxReason, description?: string, referenceId?: string) {
    const wallet = await prisma.wallet.upsert({
      where:  { userId },
      update: {},
      create: { userId, balance: 0 },
    });

    const newBalance = wallet.balance + amount;

    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type:     WalletTxType.CREDIT,
          reason,
          amount,
          balance:  newBalance,
          description,
          referenceId,
        },
      });
    });
  },

  async debit(userId: string, amount: number, reason: WalletTxReason, description?: string, referenceId?: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundError("Wallet");
    if (wallet.balance < amount) {
      throw new AppError("Insufficient wallet balance", 400, "INSUFFICIENT_BALANCE");
    }

    const newBalance = wallet.balance - amount;

    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });
      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type:     WalletTxType.DEBIT,
          reason,
          amount,
          balance:  newBalance,
          description,
          referenceId,
        },
      });
    });
  },
};
