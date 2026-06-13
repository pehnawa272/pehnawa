import { z } from "zod";

export const UpdateCustomerSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  phone:     z.string().regex(/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number").optional(),
  avatarUrl: z.string().url().optional(),
});

export const CreateAddressSchema = z.object({
  label:     z.string().max(50).optional(),
  name:      z.string().min(1).max(100),
  phone:     z.string().regex(/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number"),
  line1:     z.string().min(1).max(200),
  line2:     z.string().max(200).optional(),
  city:      z.string().min(1).max(100),
  state:     z.string().min(1).max(100),
  pincode:   z.string().regex(/^[0-9]{4,10}$/, "Invalid PIN code"),
  country:   z.string().length(2).default("IN"),
  isDefault: z.boolean().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type CreateAddressInput  = z.infer<typeof CreateAddressSchema>;
