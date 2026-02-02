import { mkdir, readFile, writeFile, unlink, stat, readdir } from "fs/promises";
import { join, dirname, relative } from "path";
import { existsSync } from "fs";
import { randomUUID } from "crypto";
import type {
  StorageService,
  StorageFile,
  StorageUploadOptions,
  StorageGetOptions,
  StorageListOptions,
  StorageListResult,
} from "./types";

/**
 * Local filesystem storage implementation.
 * Stores files in a specified directory on the local filesystem.
 */
export class LocalStorageService implements StorageService {
  private readonly basePath: string;
  private readonly baseUrl: string;

  constructor(basePath: string, baseUrl: string = "/api/attachments") {
    this.basePath = basePath;
    this.baseUrl = baseUrl;
  }

  /**
   * Ensures the storage directory exists.
   */
  private async ensureDir(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  /**
   * Generates a unique storage key for a file.
   */
  private generateKey(filename?: string): string {
    const uuid = randomUUID();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Organize files by year/month for better filesystem performance
    const basePath = `${year}/${month}/${uuid}`;

    if (filename) {
      // Sanitize filename to prevent path traversal
      const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      return `${basePath}/${sanitized}`;
    }

    return basePath;
  }

  async upload(data: Buffer, options: StorageUploadOptions): Promise<StorageFile> {
    const key = options.key ?? this.generateKey(options.filename);
    const fullPath = join(this.basePath, key);

    await this.ensureDir(fullPath);
    await writeFile(fullPath, data);

    return {
      key,
      filename: options.filename ?? key.split("/").pop() ?? key,
      mimeType: options.mimeType,
      size: data.length,
    };
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const fullPath = join(this.basePath, key);
      return await readFile(fullPath);
    } catch {
      return null;
    }
  }

  async getUrl(key: string, _options?: StorageGetOptions): Promise<string> {
    // For local storage, we return an API endpoint URL
    // The actual file serving is handled by the attachments API route
    return `${this.baseUrl}/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<boolean> {
    try {
      const fullPath = join(this.basePath, key);
      await unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullPath = join(this.basePath, key);
      await stat(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async list(options?: StorageListOptions): Promise<StorageListResult> {
    const searchPath = options?.prefix
      ? join(this.basePath, options.prefix)
      : this.basePath;

    const limit = options?.limit ?? 100;
    const files: StorageFile[] = [];

    try {
      const entries = await this.readDirRecursive(searchPath);

      for (const entry of entries.slice(0, limit)) {
        const key = relative(this.basePath, entry.path);
        files.push({
          key,
          filename: entry.name,
          mimeType: "application/octet-stream", // Would need mime lookup for actual type
          size: entry.size,
        });
      }

      return {
        files,
        hasMore: entries.length > limit,
      };
    } catch {
      return { files: [], hasMore: false };
    }
  }

  /**
   * Recursively reads a directory and returns file information.
   */
  private async readDirRecursive(
    dirPath: string
  ): Promise<Array<{ path: string; name: string; size: number }>> {
    const results: Array<{ path: string; name: string; size: number }> = [];

    if (!existsSync(dirPath)) {
      return results;
    }

    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subResults = await this.readDirRecursive(fullPath);
        results.push(...subResults);
      } else if (entry.isFile()) {
        const stats = await stat(fullPath);
        results.push({
          path: fullPath,
          name: entry.name,
          size: stats.size,
        });
      }
    }

    return results;
  }
}
