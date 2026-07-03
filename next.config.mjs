import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Explicitly set the workspace root so Next.js doesn't pick up the
    // stray package-lock.json at /Users/ashrayamishra/ instead of this project.
    root: projectRoot,
  },

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

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://va.vercel-insights.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: https://res.cloudinary.com https://lh3.googleusercontent.com;",
              "connect-src 'self' ws: wss: https://api.razorpay.com https://va.vercel-insights.com;",
              "frame-src 'self' https://checkout.razorpay.com;",
              "frame-ancestors 'none';",
              "font-src 'self';",
              "media-src 'self' https://res.cloudinary.com;",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
            ].join(" "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
