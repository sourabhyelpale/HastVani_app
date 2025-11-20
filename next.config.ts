import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 👈 enables static export (replaces `next export`)
  images: {
    unoptimized: true, // 👈 required if you use <Image /> in static export
  },
  trailingSlash: true, // 👈 optional but helps with static routes in Capacitor
};

export default nextConfig;
