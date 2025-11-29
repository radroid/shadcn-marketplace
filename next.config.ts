import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Use unoptimized for Cloudflare Pages compatibility
    unoptimized: true,
  },
  // Cloudflare Pages compatibility - standalone for Edge runtime with middleware
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure compatibility with Cloudflare Workers runtime
  experimental: {
    serverComponentsExternalPackages: ['convex'],
  },
};

export default nextConfig;
