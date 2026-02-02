import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone for Docker, export for Capacitor mobile
  output: process.env.BUILD_MODE === 'capacitor' ? 'export' : 'standalone',
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
