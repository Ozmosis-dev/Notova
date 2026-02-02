/**
 * Supabase Storage Service
 * 
 * Uses Supabase Storage for cloud-based file storage with built-in CDN,
 * image transformations, and edge caching for optimal performance.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
    StorageService,
    StorageFile,
    StorageUploadOptions,
    StorageGetOptions,
    StorageListOptions,
    StorageListResult
} from './types';

const BUCKET_NAME = 'attachments';

interface SupabaseStorageConfig {
    url: string;
    serviceKey: string;  // Service role key for server-side operations
}

/**
 * Image transformation options for Supabase Storage
 */
export interface ImageTransformOptions {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    quality?: number;  // 1-100
    format?: 'origin' | 'avif' | 'webp';
}

export class SupabaseStorageService implements StorageService {
    private client: SupabaseClient;

    constructor(config: SupabaseStorageConfig) {
        this.client = createClient(config.url, config.serviceKey, {
            auth: { persistSession: false }
        });
    }

    /**
     * Upload a file to Supabase Storage
     */
    async upload(data: Buffer, options: StorageUploadOptions): Promise<StorageFile> {
        const key = options.key || `${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const { error } = await this.client.storage
            .from(BUCKET_NAME)
            .upload(key, data, {
                contentType: options.mimeType || 'application/octet-stream',
                upsert: true,
                cacheControl: '31536000', // 1 year cache
            });

        if (error) {
            throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
        }

        return {
            key,
            filename: options.filename || key,
            mimeType: options.mimeType,
            size: data.length,
        };
    }

    /**
     * Store a file in Supabase Storage (alias for upload)
     */
    async store(key: string, data: Buffer, options?: { contentType?: string }): Promise<string> {
        const { error } = await this.client.storage
            .from(BUCKET_NAME)
            .upload(key, data, {
                contentType: options?.contentType || 'application/octet-stream',
                upsert: true,
                cacheControl: '31536000', // 1 year cache
            });

        if (error) {
            throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
        }

        return key;
    }

    /**
     * Get a file from Supabase Storage
     */
    async get(key: string): Promise<Buffer | null> {
        const { data, error } = await this.client.storage
            .from(BUCKET_NAME)
            .download(key);

        if (error) {
            console.error('Error downloading from Supabase:', error);
            return null;
        }

        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    /**
     * Delete a file from Supabase Storage
     */
    async delete(key: string): Promise<boolean> {
        const { error } = await this.client.storage
            .from(BUCKET_NAME)
            .remove([key]);

        if (error) {
            console.error('Error deleting from Supabase:', error);
            return false;
        }

        return true;
    }

    /**
     * Check if a file exists in Supabase Storage
     */
    async exists(key: string): Promise<boolean> {
        const parts = key.split('/');
        const filename = parts.pop() || key;
        const folder = parts.join('/');

        const { data } = await this.client.storage
            .from(BUCKET_NAME)
            .list(folder, {
                search: filename,
            });

        return data !== null && data.length > 0;
    }

    /**
     * Get the public URL for a file
     */
    async getUrl(key: string, _options?: StorageGetOptions): Promise<string> {
        const { data } = this.client.storage
            .from(BUCKET_NAME)
            .getPublicUrl(key);

        return data.publicUrl;
    }

    /**
     * List files in storage
     */
    async list(options?: StorageListOptions): Promise<StorageListResult> {
        const { data, error } = await this.client.storage
            .from(BUCKET_NAME)
            .list(options?.prefix || '', {
                limit: options?.limit || 100,
                offset: options?.cursor ? parseInt(options.cursor, 10) : 0,
            });

        if (error) {
            throw new Error(`Failed to list files: ${error.message}`);
        }

        const files: StorageFile[] = (data || []).map(file => ({
            key: options?.prefix ? `${options.prefix}/${file.name}` : file.name,
            filename: file.name,
            mimeType: file.metadata?.mimetype || 'application/octet-stream',
            size: file.metadata?.size || 0,
        }));

        const nextOffset = (options?.cursor ? parseInt(options.cursor, 10) : 0) + files.length;

        return {
            files,
            cursor: files.length === (options?.limit || 100) ? String(nextOffset) : undefined,
            hasMore: files.length === (options?.limit || 100),
        };
    }

    /**
     * Get a transformed image URL with CDN optimizations
     * 
     * Supabase Storage supports on-the-fly image transformations:
     * - Automatic format conversion (WebP/AVIF)
     * - Resizing with various modes
     * - Quality adjustment
     * - Edge caching for all transformations
     */
    getTransformedImageUrl(key: string, options: ImageTransformOptions = {}): string {
        const { data } = this.client.storage
            .from(BUCKET_NAME)
            .getPublicUrl(key, {
                transform: {
                    width: options.width,
                    height: options.height,
                    resize: options.resize || 'contain',
                    quality: options.quality || 80,
                    format: (options.format === 'avif' || options.format === 'webp'
                        ? options.format
                        : undefined) as 'origin' | undefined,
                },
            });

        return data.publicUrl;
    }

    /**
     * Generate responsive image URLs for srcSet
     */
    getResponsiveImageUrls(key: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
        return widths
            .map(w => `${this.getTransformedImageUrl(key, { width: w })} ${w}w`)
            .join(', ');
    }

    /**
     * Get a low-quality placeholder for blur-up effect
     */
    getPlaceholderUrl(key: string): string {
        return this.getTransformedImageUrl(key, {
            width: 20,
            quality: 20,
            format: 'webp',
        });
    }
}

/**
 * Check if the storage key points to an image
 */
export function isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
}

/**
 * Get optimal image format based on accept header
 */
export function getOptimalFormat(acceptHeader: string): 'avif' | 'webp' | 'origin' {
    if (acceptHeader.includes('image/avif')) return 'avif';
    if (acceptHeader.includes('image/webp')) return 'webp';
    return 'origin';
}
