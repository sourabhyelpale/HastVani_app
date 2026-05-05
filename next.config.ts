import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone for Docker, export for Capacitor, default (undefined) for Vercel
  output: process.env.BUILD_MODE === 'capacitor'
    ? 'export'
    : process.env.BUILD_MODE === 'docker'
      ? 'standalone'
      : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.example.com',
      },
    ],
  },
  trailingSlash: true,
  // Environment variables available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ML_API_URL: process.env.NEXT_PUBLIC_ML_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

export default nextConfig;
