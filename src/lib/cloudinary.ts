/**
 * Cloudinary configuration and upload helpers.
 *
 * Product images are uploaded to:   pehnawa/products/{slug}/
 * Product videos are uploaded to:   pehnawa/videos/{slug}/
 */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure:     true,
});

export { cloudinary };

/**
 * Upload a product image from a URL or base64 string.
 * Returns the secure URL and public_id needed for the ProductImage row.
 */
export async function uploadProductImage(
  source: string,      // URL or base64 data URI
  productSlug: string,
  index: number = 0
): Promise<{ url: string; cloudinaryId: string }> {
  const result = await cloudinary.uploader.upload(source, {
    folder:           `pehnawa/products/${productSlug}`,
    public_id:        `${productSlug}-${index}`,
    overwrite:        true,
    transformation:   [
      { width: 1200, height: 1600, crop: "fill", gravity: "auto" },
      { quality: "auto:best", fetch_format: "auto" },
    ],
  });

  return { url: result.secure_url, cloudinaryId: result.public_id };
}

/**
 * Delete an image from Cloudinary by its public_id.
 * Call this when removing a ProductImage row.
 */
export async function deleteCloudinaryAsset(cloudinaryId: string): Promise<void> {
  await cloudinary.uploader.destroy(cloudinaryId);
}

/**
 * Generate a signed upload URL for direct client-side uploads.
 * Returns params to pass to Cloudinary's upload widget / fetch.
 */
export function getSignedUploadParams(folder: string): {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
} {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey:    process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}
