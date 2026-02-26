import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  images: { domains: [] },
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
};

export default nextConfig;
