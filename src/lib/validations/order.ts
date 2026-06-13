import { z } from "zod";
import { OrderStatus } from "@/generated/client";

export const CustomTailoringSchema = z.object({
  neckline:          z.string().max(50).optional(),
  sleeve:            z.string().max(50).optional(),
  customSizeEnabled: z.boolean().default(false),
  bust:              z.string().max(10).optional(),
  waist:             z.string().max(10).optional(),
  height:            z.string().max(10).optional(),
  notes:             z.string().max(500).optional(),
});

export const OrderItemInputSchema = z.object({
  productId:           z.string().min(1),
  quantity:            z.number().int().positive().max(10),
  size:                z.string().max(20).optional(),
  customTailoring:     CustomTailoringSchema.optional(),
  measurementProfileId: z.string().cuid().optional(),
});

export const CreateOrderSchema = z.object({
  clerkId:           z.string().min(1),
  addressId:         z.string().cuid(),
  items:             z.array(OrderItemInputSchema).min(1).max(20),
  walletAmountToUse: z.number().int().min(0).default(0),
  giftDraping:       z.boolean().default(false),
  giftMessage:       z.string().max(300).optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status:             z.nativeEnum(OrderStatus).optional(),
  trackingCode:       z.string().max(100).optional(),
  shippingCarrier:    z.string().max(100).optional(),
  trackingUrl:        z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
}).refine(
  (data) => data.status !== OrderStatus.CANCELLED || data.cancellationReason !== undefined,
  { message: "Cancellation reason is required when cancelling an order", path: ["cancellationReason"] }
);

export const CancelOrderSchema = z.object({
  reason: z.string().min(5).max(500),
});

export type CreateOrderInput   = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput   = z.infer<typeof UpdateOrderStatusSchema>;
