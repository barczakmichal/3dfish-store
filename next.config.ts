import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Mark Prisma client as external to prevent bundling issues with pnpm symlinks
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'treefish.pl',
        pathname: '/products/**',
      },
    ],
  },
};

export default nextConfig;
