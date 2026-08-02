import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - allowedDevOrigins is valid in newer Next.js config but types might be outdated
  allowedDevOrigins: ['10.229.128.134', '127.0.0.1', 'localhost']
};

export default nextConfig;
