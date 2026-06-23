import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev mode: full Next.js server with API routes
  // Static export: use next.config.export.ts via build-static.sh
  basePath: "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
