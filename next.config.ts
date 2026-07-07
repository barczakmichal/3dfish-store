import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Mark Prisma client as external to prevent bundling issues with pnpm symlinks
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {},
  // Furgonetka "Własne źródło sprzedaży" woła stałe ścieżki względem adresu sklepu:
  // GET {shopUrl}/orders oraz POST {shopUrl}/orders/{id}/tracking_number (podkreślnik).
  async rewrites() {
    return [
      { source: '/orders', destination: '/api/furgonetka/orders' },
      { source: '/orders/:id/tracking_number', destination: '/api/furgonetka/orders/:id/tracking-number' },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'treefish.pl',
        pathname: '/products/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.thingiverse.com',
      },
      {
        protocol: 'https',
        hostname: 'media.printables.com',
      },
    ],
  },
};

export default nextConfig;
