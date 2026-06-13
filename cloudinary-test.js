#!/usr/bin/env node

const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary with inline credentials
cloudinary.config({ 
  cloud_name: 'dum5ay3ng', 
  api_key: '477527976811784', 
  api_secret: 'LUU-cvxC0jMSoX68kymoB_HlEps' 
});

const sampleUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

console.log("Uploading sample image to Cloudinary...");

// 2. Upload sample image
cloudinary.uploader.upload(sampleUrl, {
  folder: 'onboarding_test'
}, function(error, result) {
  if (error) {
    console.error("Upload failed:", error);
    process.exit(1);
  }

  console.log("Upload successful!");
  console.log("Secure URL: " + result.secure_url);
  console.log("Public ID: " + result.public_id);

  // 3. Get and print image details/metadata
  console.log("\n--- Image Details ---");
  console.log("Width: " + result.width + "px");
  console.log("Height: " + result.height + "px");
  console.log("Format: " + result.format);
  console.log("File Size: " + result.bytes + " bytes");

  // 4. Transform the image
  const transformedUrl = cloudinary.url(result.public_id, {
    secure: true,
    transformation: [
      // f_auto: Automatically selects the best and most modern image format (e.g. WebP, AVIF) supported by the client browser.
      { fetch_format: 'auto' },
      // q_auto: Automatically optimizes the compression level to minimize file size while maintaining visual quality.
      { quality: 'auto' }
    ]
  });

  console.log("\nDone! Click link below to see optimized version of the image. Check the size and the format.");
  console.log(transformedUrl);
});
