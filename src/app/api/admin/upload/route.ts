/**
 * POST /api/admin/upload
 *
 * Returns a signed Cloudinary upload signature for direct browser-to-Cloudinary uploads.
 * The client uses these params with Cloudinary's upload API — no file data passes through
 * our server, keeping it fast and within serverless function size limits.
 *
 * Body: { folder?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadParams } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/admin-guard";
import { successResponse, handleError } from "@/lib/errors";

/** Returns true only when real (non-placeholder) Cloudinary credentials are set */
function cloudinaryConfigured(): boolean {
  const key    = process.env.CLOUDINARY_API_KEY                || "";
  const secret = process.env.CLOUDINARY_API_SECRET             || "";
  const cloud  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  return (
    key    !== "" && key    !== "000000000000000"              &&
    secret !== "" && secret !== "xxxxxxxxxxxxxxxxxxxxxxxxxxxx" &&
    cloud  !== "" && cloud  !== "your_cloud_name"
  );
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard instanceof NextResponse) return guard;

    // Give a helpful error instead of Cloudinary's cryptic "Unknown API key" message
    if (!cloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary is not configured. Please set CLOUDINARY_API_KEY, " +
            "CLOUDINARY_API_SECRET, and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME " +
            "in your .env file with real credentials from cloudinary.com.",
        },
        { status: 503 }
      );
    }

    const { folder = "pehnawa/products" } = await req.json();
    const params = getSignedUploadParams(folder);
    return successResponse(params);
  } catch (e) {
    return handleError(e);
  }
}
