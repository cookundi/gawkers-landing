import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/mint",
        destination: "/",
      },
      {
        source: "/ecosystem",
        destination: "/",
      },
      {
        source: "/mission",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;