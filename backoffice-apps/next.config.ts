import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'is3.cloudhost.id',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;