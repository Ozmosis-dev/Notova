/**
 * Resource Extractor
 * 
 * Extracts resources (attachments) from ENEX notes and uploads them to storage.
 * Generates a ResourceHashMap for use in ENML to HTML conversion.
 */

import { createHash } from 'crypto';
import { getStorageService } from '@/lib/storage';
import type { EnexResource, ResourceHashMap } from '@/types/enex';

/**
 * Result of extracting a single resource.
 */
export interface ExtractedResource {
    /** Storage key (path in storage) */
    storageKey: string;
    /** Public URL for the resource */
    url: string;
    /** MD5 hash of the resource data */
    hash: string;
    /** Original filename */
    filename: string;
    /** MIME type */
    mimeType: string;
    /** Size in bytes */
    size: number;
    /** Width (for images) */
    width?: number;
    /** Height (for images) */
    height?: number;
}

/**
 * Options for resource extraction.
 */
export interface ExtractResourcesOptions {
    /** User ID for organizing storage */
    userId: string;
    /** Note ID for organizing storage */
    noteId: string;
    /** Import job ID for tracking */
    importJobId?: string;
}

/**
 * Calculate MD5 hash of data (matching Evernote's resource hash format).
 */
export function calculateMd5Hash(data: Buffer): string {
    return createHash('md5').update(data).digest('hex');
}

/**
 * Generate a unique filename for a resource.
 */
function generateFilename(
    resource: EnexResource,
    hash: string
): string {
    // Use original filename if available
    if (resource.resourceAttributes?.fileName) {
        // Sanitize the filename
        const originalName = resource.resourceAttributes.fileName
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .substring(0, 100);
        // Add hash prefix to ensure uniqueness
        const ext = originalName.split('.').pop() || getExtensionFromMime(resource.mime);
        const baseName = originalName.replace(/\.[^.]+$/, '');
        return `${baseName}_${hash.substring(0, 8)}.${ext}`;
    }

    // Generate filename from hash and MIME type
    const ext = getExtensionFromMime(resource.mime);
    return `resource_${hash.substring(0, 16)}.${ext}`;
}

/**
 * Get file extension from MIME type.
 */
function getExtensionFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/bmp': 'bmp',
        'image/tiff': 'tiff',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/ogg': 'ogg',
        'audio/m4a': 'm4a',
        'audio/x-m4a': 'm4a',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'video/quicktime': 'mov',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/plain': 'txt',
        'text/html': 'html',
        'text/csv': 'csv',
    };

    return mimeToExt[mimeType] || 'bin';
}

/**
 * Extract a single resource and upload to storage.
 */
export async function extractResource(
    resource: EnexResource,
    options: ExtractResourcesOptions
): Promise<ExtractedResource> {
    const storage = getStorageService();

    // Decode base64 data
    const dataBuffer = Buffer.from(resource.data, 'base64');

    // Calculate MD5 hash (this is what Evernote uses for en-media references)
    const hash = calculateMd5Hash(dataBuffer);

    // Generate filename and storage path
    const filename = generateFilename(resource, hash);
    const storageKey = `attachments/${options.userId}/${options.noteId}/${filename}`;

    // Upload to storage
    const uploadResult = await storage.upload(dataBuffer, {
        key: storageKey,
        mimeType: resource.mime,
        filename,
    });

    // Get URL for the uploaded file
    const url = await storage.getUrl(uploadResult.key);

    return {
        storageKey: uploadResult.key,
        url,
        hash,
        filename,
        mimeType: resource.mime,
        size: dataBuffer.length,
        width: resource.width,
        height: resource.height,
    };
}

/**
 * Extract all resources from a list and build a ResourceHashMap.
 */
export async function extractResources(
    resources: EnexResource[],
    options: ExtractResourcesOptions
): Promise<{
    extracted: ExtractedResource[];
    hashMap: ResourceHashMap;
    errors: Array<{ index: number; error: string }>;
}> {
    const extracted: ExtractedResource[] = [];
    const hashMap: ResourceHashMap = new Map();
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        if (!resource) continue;

        try {
            const result = await extractResource(resource, options);
            extracted.push(result);

            // Add to hash map for ENML conversion
            hashMap.set(result.hash, {
                url: result.url,
                mimeType: result.mimeType,
                filename: result.filename,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push({ index: i, error: errorMessage });
            console.error(`Failed to extract resource ${i}:`, errorMessage);
        }
    }

    return { extracted, hashMap, errors };
}

/**
 * Check if a resource with the given hash already exists in storage.
 * Returns the URL if it exists, undefined otherwise.
 */
export async function findExistingResource(
    hash: string,
    userId: string
): Promise<string | undefined> {
    const storage = getStorageService();
    const prefix = `attachments/${userId}/`;

    try {
        // List files to find one with matching hash
        // This is a simple implementation - could be optimized with a database lookup
        const result = await storage.list({ prefix, limit: 1000 });

        for (const file of result.files) {
            // Check if filename contains the hash
            if (file.key.includes(hash.substring(0, 8))) {
                return await storage.getUrl(file.key);
            }
        }
    } catch (error) {
        console.error('Error checking for existing resource:', error);
    }

    return undefined;
}

/**
 * Get the total size of resources in bytes.
 */
export function calculateTotalResourceSize(resources: EnexResource[]): number {
    return resources.reduce((total, resource) => {
        // Estimate size from base64 (base64 is ~4/3 the size of binary)
        const estimatedSize = Math.ceil(resource.data.length * 0.75);
        return total + estimatedSize;
    }, 0);
}
