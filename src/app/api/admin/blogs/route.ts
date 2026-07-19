import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateBlogSchema } from "@/lib/validations/blog";
import { successResponse, handleError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";

// GET /api/admin/blogs — list all blog posts (including drafts)
export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const blogs = await prisma.blog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(blogs);
  } catch (e) {
    return handleError(e);
  }
}

// POST /api/admin/blogs — create a new blog post
export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const body = await req.json();
    const input = CreateBlogSchema.parse(body);

    const publishedAt = input.isPublished ? new Date() : null;

    const blog = await prisma.blog.create({
      data: {
        ...input,
        publishedAt,
      },
    });

    return successResponse(blog, 201);
  } catch (e) {
    return handleError(e);
  }
}
