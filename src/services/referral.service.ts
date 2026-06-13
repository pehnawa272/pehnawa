import { prisma } from "@/lib/prisma";
import { WalletTxReason } from "@/generated/client";
import { NotFoundError, AppError, ConflictError } from "@/lib/errors";
import { WalletService } from "./wallet.service";

export const ReferralService = {

  // Read-only: returns existing referral code or throws NotFoundError
  async getByClerkId(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    const referralCode = await prisma.referralCode.findUnique({
      where:   { userId: user.id },
      include: {
        records: {
          orderBy: { createdAt: "desc" },
          include: { referred: { select: { name: true, email: true, createdAt: true } } },
        },
      },
    });
    if (!referralCode) throw new NotFoundError("Referral code");

    return referralCode;
  },

  async getOrCreateCode(clerkId: string) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new NotFoundError("User");

    return prisma.referralCode.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        userId:        user.id,
        code:          ReferralService.generateCode(user.name),
        referrerBonus: 10000, // ₹100
        referredBonus: 5000,  // ₹50
      },
      include: {
        records: {
          orderBy: { createdAt: "desc" },
          include: { referred: { select: { name: true, email: true, createdAt: true } } },
        },
      },
    });
  },

  generateCode(name: string | null): string {
    const base   = (name ?? "USER").replace(/\s+/g, "").substring(0, 7).toUpperCase();
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${base}${suffix}`;
  },

  async applyCode(clerkId: string, code: string) {
    const newUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!newUser) throw new NotFoundError("User");

    const referralCode = await prisma.referralCode.findUnique({ where: { code } });
    if (!referralCode || !referralCode.isActive) {
      throw new AppError("Invalid or inactive referral code", 400, "INVALID_CODE");
    }
    if (referralCode.userId === newUser.id) {
      throw new AppError("You cannot use your own referral code", 400, "SELF_REFERRAL");
    }
    if (referralCode.maxUses !== null && referralCode.usesCount >= referralCode.maxUses) {
      throw new AppError("This referral code has reached its usage limit", 400, "CODE_EXHAUSTED");
    }

    const existing = await prisma.referralRecord.findUnique({
      where: { referralCodeId_referredId: { referralCodeId: referralCode.id, referredId: newUser.id } },
    });
    if (existing) throw new ConflictError("You have already used a referral code");

    await prisma.$transaction(async (tx) => {
      await tx.referralRecord.create({
        data: {
          referralCodeId:   referralCode.id,
          referrerId:       referralCode.userId,
          referredId:       newUser.id,
          referredRewarded: true,
        },
      });
      await tx.referralCode.update({
        where: { id: referralCode.id },
        data:  { usesCount: { increment: 1 } },
      });
    });

    // Credit new user's wallet
    await WalletService.credit(
      newUser.id,
      referralCode.referredBonus,
      WalletTxReason.REFERRAL_BONUS,
      `Welcome bonus — referred by code ${code}`,
      referralCode.id
    );

    return { bonusAwarded: referralCode.referredBonus };
  },

  // Called after a referred user's first order is delivered
  async approveReferrerReward(referredUserId: string, orderId: string) {
    const record = await prisma.referralRecord.findFirst({
      where:   { referredId: referredUserId, referrerRewarded: false },
      include: { referralCode: true },
    });
    if (!record) return null; // no pending referrer reward

    await prisma.referralRecord.update({
      where: { id: record.id },
      data:  { referrerRewarded: true, rewardedAt: new Date(), triggerOrderId: orderId },
    });

    await WalletService.credit(
      record.referrerId,
      record.referralCode.referrerBonus,
      WalletTxReason.REFERRAL_BONUS,
      `Referral reward — your referral placed their first order`,
      record.id
    );

    return { rewardedAmount: record.referralCode.referrerBonus };
  },
};
