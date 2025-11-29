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
  typescript: {
    ignoreBuildErrors: true,
  },
  // Next.js 16: moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: ['convex'],
  // Skip static optimization for error pages to avoid build issues
  skipTrailingSlashRedirect: true,
  // Disable static page generation to avoid SSR issues with client components
  output: 'standalone',
};

export default nextConfig;
