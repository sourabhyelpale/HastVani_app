import type { NextConfig } from "next";

const buildMode = process.env.BUILD_MODE;

const baseConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.example.com' },
      { protocol: 'https', hostname: '*.railway.app' },
    ],
  },
  // Environment variables available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ML_API_URL: process.env.NEXT_PUBLIC_ML_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_ML_WS_URL: process.env.NEXT_PUBLIC_ML_WS_URL,
  },
};

// standalone for Docker, export for Capacitor, no output key for Vercel (default SSR)
if (buildMode === 'capacitor') {
  baseConfig.output = 'export';
  baseConfig.trailingSlash = true;
} else if (buildMode === 'docker') {
  baseConfig.output = 'standalone';
}

export default baseConfig;
