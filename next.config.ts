import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["reunion-hepatitis-address-care.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
