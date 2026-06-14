import { z } from "zod";
import { CustomTailoringSchema } from "./order";

export const AddToCartSchema = z.object({
  productId:       z.string().cuid(),
  quantity:        z.number().int().positive().max(10).default(1),
  size:            z.string().max(20).optional(),
  colour:          z.string().max(50).nullish(),
  customTailoring: CustomTailoringSchema.optional(),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(10), // 0 = remove
});

export type AddToCartInput     = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
