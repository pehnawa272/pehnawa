import { z } from "zod";
import { ProductCategory, ProductStatus, ProductSubCategory } from "@/generated/client";

// Base schema without refinement — used for partial updates
const ProductBaseSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens only"),
  title:         z.string().min(2).max(200),
  subTitle:      z.string().max(200).nullish(),
  description:   z.string().min(10),
  fabric:        z.string().max(100).nullish(),
  embroidery:    z.string().max(100).nullish(),
  details:       z.array(z.string()).default([]),
  colours:       z.array(z.string().max(50)).default([]),
  category:      z.nativeEnum(ProductCategory),
  subCategory:   z.nativeEnum(ProductSubCategory).nullish(),
  price:         z.number().int().positive().nullish(),
  mrp:           z.number().int().positive().nullish(),
  isEnquireOnly: z.boolean().default(false),
  craftingHours: z.number().int().positive().nullish(),
  isFeatured:    z.boolean().default(false),
  sortOrder:     z.number().int().default(0),
  occasionIds:   z.array(z.string().cuid()).default([]),
});

export const CreateProductSchema = ProductBaseSchema.refine(
  (data) => data.isEnquireOnly || (data.price !== undefined && data.price !== null),
  { message: "Price is required unless isEnquireOnly is true", path: ["price"] }
);

// Partial update — no refinement needed (fields are individually optional)
export const UpdateProductSchema = ProductBaseSchema.partial().omit({ slug: true });

export const ProductStatusSchema = z.object({
  status: z.nativeEnum(ProductStatus),
});

export const ProductFilterSchema = z.object({
  category:   z.nativeEnum(ProductCategory).optional(),
  status:     z.nativeEnum(ProductStatus).optional(),
  featured:   z.coerce.boolean().optional(),
  search:     z.string().max(100).optional(),
  minPrice:   z.coerce.number().int().optional(),
  maxPrice:   z.coerce.number().int().optional(),
  occasionId: z.string().cuid().optional(),
  page:       z.coerce.number().int().positive().default(1),
  limit:      z.coerce.number().int().positive().max(100).default(12),
  sortBy:     z.enum(["createdAt", "price"]).optional(),
  sortOrder:  z.enum(["asc", "desc"]).optional(),
});

export const AddProductImageSchema = z.object({
  url:         z.string().url(),
  cloudinaryId: z.string().min(1),
  alt:         z.string().max(200).optional(),
  isPrimary:   z.boolean().default(false),
  sortOrder:   z.number().int().default(0),
});

export const ReorderImagesSchema = z.object({
  // Array of { id, sortOrder } pairs
  order: z.array(z.object({
    id:        z.string().cuid(),
    sortOrder: z.number().int(),
  })).min(1),
});

export const AddProductVideoSchema = z.object({
  url:         z.string().url(),
  cloudinaryId: z.string().min(1),
  thumbnail:   z.string().url().optional(),
  sortOrder:   z.number().int().default(0),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductFilterInput = z.infer<typeof ProductFilterSchema>;
