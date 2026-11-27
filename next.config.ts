import type { NextConfig } from "next";
import { readdirSync } from "node:fs";

// Payment logo files actually present in /public/payments, so the site never requests files that don't exist.
let paymentFiles = "";
try { paymentFiles = readdirSync("./public/payments").filter((f) => /\.(svg|png|webp)$/i.test(f)).join(","); } catch { /* none */ }

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_PAYMENT_FILES: paymentFiles },
  poweredByHeader: false,
  images: {
    // Pexels resizes on its own CDN, so we use a custom loader that requests
    // the exact width Next.js asks for (responsive srcset + lazy loading
    // without spending Vercel image-optimisation quota).
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560, 3200, 3840],
    imageSizes: [96, 160, 256, 384, 512],
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
