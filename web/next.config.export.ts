import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/review-handbook",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
