import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
    proxyClientMaxBodySize: '500mb',
  },
  // Configuração Turbopack (Next.js 16+)
  turbopack: {
    rules: {
      // Ignorar arquivos binários e README do ffmpeg
      '*.{exe,node,md}': {
        loaders: ['ignore-loader'],
        as: '*.js',
      },
    },
  },
  serverExternalPackages: [
    '@ffmpeg-installer/ffmpeg',
    '@ffprobe-installer/ffprobe',
  ],
};

export default nextConfig;
