import type { NextConfig } from 'next';

const isElectron = process.env.ELECTRON === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Output standalone para Electron (empacotamento)
  output: isElectron ? 'standalone' : undefined,
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
  // Garantir que variáveis de ambiente sejam carregadas
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
};

export default nextConfig;
