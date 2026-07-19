import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadParams } from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/ratelimit";
import { successResponse, handleError } from "@/lib/errors";

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

/**
 * POST /api/reviews/upload
 * Returns a signed Cloudinary upload signature for direct browser-to-Cloudinary uploads by customers.
 * Restricted to the 'pehnawa/reviews' folder.
 * Rate limit: 20 signatures per hour per IP.
 */
export async function POST(req: NextRequest) {
  try {
    const rl = await checkRateLimit(req, "review_upload_sign", { requests: 20, duration: "1 h" });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (!cloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Image upload is temporarily unavailable (Cloudinary not configured)." },
        { status: 503 }
      );
    }

    // Force folder to 'pehnawa/reviews' for security
    const folder = "pehnawa/reviews";
    const params = getSignedUploadParams(folder);
    return successResponse(params);
  } catch (e) {
    return handleError(e);
  }
}
