'use client';

/**
 * OptimizedImage Component
 * 
 * A performance-optimized image component that provides:
 * - Automatic lazy loading
 * - Blur-up placeholder effect
 * - Responsive srcSet generation
 * - Format optimization (WebP/AVIF)
 * - CDN integration via Next.js Image or direct URLs
 */

import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    className?: string;
    sizes?: string;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    onLoad?: () => void;
    onError?: () => void;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

// Simple blur placeholder SVG
const shimmerSvg = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1e293b" offset="0%"/>
      <stop stop-color="#334155" offset="50%"/>
      <stop stop-color="#1e293b" offset="100%"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1e293b"/>
  <rect id="r" width="${w}" height="${h}" fill="url(#g)">
    <animate
      attributeName="x"
      dur="1.5s"
      from="-${w}"
      to="${w}"
      repeatCount="indefinite"/>
  </rect>
</svg>`;

const toBase64 = (str: string) =>
    typeof window === 'undefined'
        ? Buffer.from(str).toString('base64')
        : window.btoa(str);

const getShimmerPlaceholder = (w = 100, h = 100) =>
    `data:image/svg+xml;base64,${toBase64(shimmerSvg(w, h))}`;

/**
 * Check if URL is external (not from our app)
 */
export const isExternalUrl = (url: string): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Get image dimensions from attachment metadata
 */
interface AttachmentMeta {
    width?: number;
    height?: number;
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    fill = false,
    priority = false,
    className = '',
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    quality = 80,
    placeholder = 'blur',
    blurDataURL,
    onLoad,
    onError,
    objectFit = 'cover',
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    }, [onError]);

    // Generate shimmer placeholder if not provided
    const placeholderDataUrl = useMemo(() => {
        if (blurDataURL) return blurDataURL;
        return getShimmerPlaceholder(width || 100, height || 100);
    }, [blurDataURL, width, height]);

    // Error fallback
    if (hasError) {
        return (
            <div
                className={`flex items-center justify-center bg-slate-800 text-slate-500 ${className}`}
                style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
            >
                <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
        );
    }

    // Common image props
    const imageProps = {
        src,
        alt,
        quality,
        priority,
        sizes,
        onLoad: handleLoad,
        onError: handleError,
        placeholder: placeholder as 'blur' | 'empty',
        blurDataURL: placeholder === 'blur' ? placeholderDataUrl : undefined,
        className: `${className} ${isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-300`,
        style: { objectFit } as React.CSSProperties,
    };

    if (fill) {
        return (
            <Image
                {...imageProps}
                fill
            />
        );
    }

    return (
        <Image
            {...imageProps}
            width={width || 800}
            height={height || 600}
        />
    );
}

/**
 * Attachment Image Component
 * 
 * Specialized image component for note attachments with
 * automatic URL handling and optimization.
 */
interface AttachmentImageProps extends Omit<OptimizedImageProps, 'src'> {
    attachmentId: string;
    attachment?: AttachmentMeta;
}

export function AttachmentImage({
    attachmentId,
    attachment,
    alt,
    width,
    height,
    ...props
}: AttachmentImageProps) {
    // Use the API endpoint for attachments
    const src = `/api/attachments/${attachmentId}?download=true`;

    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={width || attachment?.width}
            height={height || attachment?.height}
            {...props}
        />
    );
}

/**
 * Helper to generate blur data URL from an image buffer
 */
export async function generateBlurPlaceholder(imageBuffer: Buffer): Promise<string> {
    // For server-side use only
    try {
        const sharp = (await import('sharp')).default;
        const resized = await sharp(imageBuffer)
            .resize(10, 10, { fit: 'inside' })
            .blur()
            .toBuffer();

        return `data:image/jpeg;base64,${resized.toString('base64')}`;
    } catch {
        // Fallback to shimmer if sharp isn't available
        return getShimmerPlaceholder(10, 10);
    }
}

export default OptimizedImage;
