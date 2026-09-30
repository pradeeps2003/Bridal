import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent MIME-type sniffing — minor SEO signal
  { key: "X-Content-Type-Options", value: "nosniff" },
  // XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Prevent iframe embedding (clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Enforce HTTPS in browsers
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Control referrer leaks
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy (privacy/performance signal)
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [50, 70, 75, 90],
    deviceSizes: [320, 375, 414, 768, 1024, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
  },
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
