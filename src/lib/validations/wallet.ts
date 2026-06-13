import { z } from "zod";

export const CreditWalletSchema = z.object({
  userId:      z.string().cuid(),
  amount:      z.number().int().positive().max(10_000_000), // max ₹1 lakh
  description: z.string().max(200).optional(),
});

export const DebitWalletSchema = z.object({
  userId:      z.string().cuid(),
  amount:      z.number().int().positive(),
  description: z.string().max(200).optional(),
  referenceId: z.string().optional(),
});

export type CreditWalletInput = z.infer<typeof CreditWalletSchema>;
export type DebitWalletInput  = z.infer<typeof DebitWalletSchema>;
