import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ hostname: "picsum.dev" }],
  },
};

export default nextConfig;
