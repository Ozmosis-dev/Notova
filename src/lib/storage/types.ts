/**
 * Storage abstraction types for file handling.
 * Supports local filesystem and S3-compatible storage backends.
 */

export interface StorageFile {
  /** Unique storage key/path for the file */
  key: string;
  /** Original filename */
  filename: string;
  /** MIME type of the file */
  mimeType: string;
  /** File size in bytes */
  size: number;
}

export interface StorageUploadOptions {
  /** Custom key/path for the file. If not provided, a unique key will be generated */
  key?: string;
  /** MIME type of the file */
  mimeType: string;
  /** Original filename */
  filename?: string;
}

export interface StorageGetOptions {
  /** Whether to return a signed/presigned URL (for S3) */
  signed?: boolean;
  /** Expiration time for signed URLs in seconds */
  expiresIn?: number;
}

export interface StorageListOptions {
  /** Prefix to filter files */
  prefix?: string;
  /** Maximum number of files to return */
  limit?: number;
  /** Continuation token for pagination */
  cursor?: string;
}

export interface StorageListResult {
  files: StorageFile[];
  cursor?: string;
  hasMore: boolean;
}

/**
 * Storage service interface.
 * All storage implementations must implement this interface.
 */
export interface StorageService {
  /**
   * Upload a file to storage.
   * @param data - File data as Buffer
   * @param options - Upload options
   * @returns Storage file metadata
   */
  upload(data: Buffer, options: StorageUploadOptions): Promise<StorageFile>;

  /**
   * Get a file from storage.
   * @param key - Storage key of the file
   * @returns File data as Buffer, or null if not found
   */
  get(key: string): Promise<Buffer | null>;

  /**
   * Get URL for accessing a file.
   * @param key - Storage key of the file
   * @param options - URL options
   * @returns URL string
   */
  getUrl(key: string, options?: StorageGetOptions): Promise<string>;

  /**
   * Delete a file from storage.
   * @param key - Storage key of the file
   * @returns True if deleted, false if not found
   */
  delete(key: string): Promise<boolean>;

  /**
   * Check if a file exists in storage.
   * @param key - Storage key of the file
   * @returns True if exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * List files in storage.
   * @param options - List options
   * @returns List of files with pagination info
   */
  list(options?: StorageListOptions): Promise<StorageListResult>;
}
