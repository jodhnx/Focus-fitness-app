import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'world.openfoodfacts.org', pathname: '/**' },
      { protocol: 'https', hostname: 'images.openfoodfacts.org', pathname: '/**' },
    ],
  },
};

export default nextConfig;
