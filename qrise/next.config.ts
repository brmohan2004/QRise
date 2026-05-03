import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable gzip compression
  compress: true,
  
  // Powered by header removal (security + slight perf)
  poweredByHeader: false,
  
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://*.supabase.co';
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || 'https://*.upstash.io';
    const workerUrl = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL || 'https://*.workers.dev';

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com https://*.googleusercontent.com;
      font-src 'self' https://fonts.gstatic.com data:;
      connect-src 'self' ${supabaseUrl} ${upstashUrl} ${workerUrl} https://*.supabase.co https://api.cloudinary.com https://res.cloudinary.com blob:;
      frame-ancestors 'none';
      form-action 'self';
      base-uri 'self';
      object-src 'none';
    `.replace(/\n/g, ' ').trim();

    return [
      {
        source: '/embed/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['bcryptjs', 'qrcode', 'sharp', 'postgres', 'detect-libc', 'drizzle-orm'],
};

export default nextConfig;