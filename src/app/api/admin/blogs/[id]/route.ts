import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateBlogSchema } from "@/lib/validations/blog";
import { successResponse, handleError } from "@/lib/errors";
import { requireAdmin } from "@/lib/admin-guard";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/blogs/[id] — get a single blog post details
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    return successResponse(blog);
  } catch (e) {
    return handleError(e);
  }
}

// PATCH /api/admin/blogs/[id] — edit a blog post
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body = await req.json();
    const input = UpdateBlogSchema.parse(body);

    const existing = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Blog post not found" },
        { status: 404 }
      );
    }

    let publishedAt = existing.publishedAt;
    if (input.isPublished !== undefined) {
      if (input.isPublished && !existing.isPublished) {
        publishedAt = new Date();
      } else if (!input.isPublished) {
        publishedAt = null;
      }
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        ...input,
        publishedAt,
      },
    });

    return successResponse(updatedBlog);
  } catch (e) {
    return handleError(e);
  }
}

// DELETE /api/admin/blogs/[id] — delete a blog post
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;

    const blog = await prisma.blog.delete({
      where: { id },
    });

    return successResponse({ id: blog.id, deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
