/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve AVIF first (50-70 % smaller than JPEG), fall back to WebP, then original.
    formats: ["image/avif", "image/webp"],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        // Cloudinary CDN — product images uploaded via Cloudinary
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],

    // 85 must be listed here or quality={85} silently rounds down to 75.
    qualities: [75, 85, 100],

    // Cache optimised images for 30 days on the server (default is 60 s).
    minimumCacheTTL: 2592000,

    // Widths used to build srcset — tuned for real device breakpoints.
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256],
  },
};

export default nextConfig;
