import { z } from "zod";

export const CreateBlogSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().min(5, "Excerpt must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  coverImage: z.string().url("Cover image must be a valid URL"),
  images: z.array(z.string().url("Image URL must be valid")).default([]),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(300).nullable().optional(),
  isPublished: z.boolean().default(false),
});

export const UpdateBlogSchema = CreateBlogSchema.partial();
