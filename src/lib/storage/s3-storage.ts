import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import type {
  StorageService,
  StorageFile,
  StorageUploadOptions,
  StorageGetOptions,
  StorageListOptions,
  StorageListResult,
} from "./types";

export interface S3StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Optional custom endpoint for S3-compatible services (MinIO, DigitalOcean Spaces, etc.) */
  endpoint?: string;
  /** Force path-style URLs (required for some S3-compatible services) */
  forcePathStyle?: boolean;
}

/**
 * S3-compatible storage implementation.
 * Works with AWS S3 and S3-compatible services like MinIO, DigitalOcean Spaces, etc.
 */
export class S3StorageService implements StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: S3StorageConfig) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle ?? !!config.endpoint,
    });
  }

  /**
   * Generates a unique storage key for a file.
   */
  private generateKey(filename?: string): string {
    const uuid = randomUUID();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const basePath = `uploads/${year}/${month}/${uuid}`;

    if (filename) {
      const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      return `${basePath}/${sanitized}`;
    }

    return basePath;
  }

  async upload(data: Buffer, options: StorageUploadOptions): Promise<StorageFile> {
    const key = options.key ?? this.generateKey(options.filename);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: options.mimeType,
      })
    );

    return {
      key,
      filename: options.filename ?? key.split("/").pop() ?? key,
      mimeType: options.mimeType,
      size: data.length,
    };
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      if (!response.Body) {
        return null;
      }

      // Convert readable stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as AsyncIterable<Uint8Array>;

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async getUrl(key: string, options?: StorageGetOptions): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    if (options?.signed !== false) {
      // Return a presigned URL
      const expiresIn = options?.expiresIn ?? 3600; // Default 1 hour
      return getSignedUrl(this.client, command, { expiresIn });
    }

    // Return a direct URL (only works for public buckets)
    // This is a simplified URL format; actual URL depends on S3 configuration
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );
      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  async list(options?: StorageListOptions): Promise<StorageListResult> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: options?.prefix,
        MaxKeys: options?.limit ?? 100,
        ContinuationToken: options?.cursor,
      })
    );

    const files: StorageFile[] = (response.Contents ?? []).map((item) => ({
      key: item.Key ?? "",
      filename: item.Key?.split("/").pop() ?? "",
      mimeType: "application/octet-stream", // S3 doesn't return content type in list
      size: item.Size ?? 0,
    }));

    return {
      files,
      cursor: response.NextContinuationToken,
      hasMore: response.IsTruncated ?? false,
    };
  }

  /**
   * Checks if an error is a "not found" error.
   */
  private isNotFoundError(error: unknown): boolean {
    if (error && typeof error === "object" && "name" in error) {
      const name = (error as { name: string }).name;
      return name === "NotFound" || name === "NoSuchKey";
    }
    return false;
  }
}
