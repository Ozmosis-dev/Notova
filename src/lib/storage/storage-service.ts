import { join } from "path";
import type { StorageService } from "./types";
import { LocalStorageService } from "./local-storage";
import { S3StorageService } from "./s3-storage";
import { SupabaseStorageService } from "./supabase-storage";

/**
 * Storage configuration from environment variables.
 */
interface StorageConfig {
  type: "local" | "s3" | "supabase";
  local?: {
    path: string;
    baseUrl?: string;
  };
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  };
  supabase?: {
    url: string;
    serviceKey: string;
  };
}

/**
 * Get storage configuration from environment variables.
 */
function getStorageConfig(): StorageConfig {
  const type = (process.env.STORAGE_TYPE ?? "local") as "local" | "s3" | "supabase";

  if (type === "supabase") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !serviceKey) {
      throw new Error(
        "Supabase storage requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables"
      );
    }

    return {
      type: "supabase",
      supabase: {
        url,
        serviceKey,
      },
    };
  }

  if (type === "s3") {
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "S3 storage requires S3_BUCKET, S3_REGION, S3_ACCESS_KEY, and S3_SECRET_KEY environment variables"
      );
    }

    return {
      type: "s3",
      s3: {
        bucket,
        region,
        accessKeyId,
        secretAccessKey,
        endpoint: process.env.S3_ENDPOINT || undefined,
      },
    };
  }

  // Default to local storage
  const localPath = process.env.STORAGE_LOCAL_PATH ?? "./uploads";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    type: "local",
    local: {
      path: localPath.startsWith("/") ? localPath : join(process.cwd(), localPath),
      baseUrl: `${appUrl}/api/attachments`,
    },
  };
}

/** Singleton instance of the storage service */
let storageInstance: StorageService | null = null;

/**
 * Get the configured storage service instance.
 * Returns a singleton instance based on environment configuration.
 */
export function getStorageService(): StorageService {
  if (!storageInstance) {
    const config = getStorageConfig();

    if (config.type === "supabase" && config.supabase) {
      storageInstance = new SupabaseStorageService(config.supabase);
    } else if (config.type === "s3" && config.s3) {
      storageInstance = new S3StorageService(config.s3);
    } else if (config.local) {
      storageInstance = new LocalStorageService(
        config.local.path,
        config.local.baseUrl
      );
    } else {
      throw new Error("Invalid storage configuration");
    }
  }

  return storageInstance;
}

/**
 * Check if we're using Supabase Storage (has CDN features)
 */
export function isSupabaseStorage(): boolean {
  const type = process.env.STORAGE_TYPE ?? "local";
  return type === "supabase";
}

/**
 * Reset the storage service instance.
 * Useful for testing or when configuration changes.
 */
export function resetStorageService(): void {
  storageInstance = null;
}

export { type StorageService, type StorageConfig };

