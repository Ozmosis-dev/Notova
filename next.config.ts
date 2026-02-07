import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Image Optimization Configuration
   * 
   * Next.js provides a built-in Image CDN that:
   * - Automatically serves WebP/AVIF formats
   * - Resizes images on-demand
   * - Caches optimized images
   * - Lazy loads images by default
   */
  images: {
    // Remote patterns for external images
    remotePatterns: [
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      },
      // Supabase Project-specific URL
      {
        protocol: 'https',
        hostname: 'kakurjqxjgfkwgvhnnta.supabase.co',
        pathname: '/**',
      },
      // AWS S3 (if using S3 storage)
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      // Any S3-compatible storage (DigitalOcean, Cloudflare R2, etc.)
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
    // Device sizes for responsive images (srcSet widths)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for layout="responsive" and layout="fill"
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache TTL for optimized images (1 year)
    minimumCacheTTL: 31536000,
    // Preferred formats (AVIF has better compression but slower to encode)
    formats: ['image/avif', 'image/webp'],
    // Disable static image imports if not needed
    disableStaticImages: false,
  },

  /**
   * Experimental features for better performance
   */
  experimental: {
    // Enable optimized image loading
    optimizePackageImports: ['@tiptap/react', '@tiptap/extension-*', 'lucide-react', 'framer-motion'],
  },

  /**
   * Headers for CDN caching
   */
  async headers() {
    return [
      {
        // Cache static assets for 1 year
        source: '/api/attachments/:id(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache static images
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
