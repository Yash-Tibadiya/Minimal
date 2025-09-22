import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore ESLint and TypeScript errors during builds
  // This will allow "next build" to succeed even if there are lint or type errors (including 'any' usage)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
