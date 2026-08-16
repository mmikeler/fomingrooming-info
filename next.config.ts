import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10MB",
    },
  },
  images: {
    remotePatterns: [
      { hostname: "picsum.dev" },
      { hostname: "*.userapi.com" },
      { hostname: "fomingrooming.info" },
    ],
  },
};

export default nextConfig;
