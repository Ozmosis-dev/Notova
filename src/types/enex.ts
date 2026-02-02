/**
 * TypeScript types for ENEX (Evernote Export) file format.
 * These types represent the structure of data parsed from .enex XML files.
 */

/**
 * Resource attributes from an Evernote note.
 */
export interface EnexResourceAttributes {
  /** Source URL if the resource was clipped from web */
  sourceUrl?: string;
  /** Unix timestamp when resource was created */
  timestamp?: string;
  /** Latitude where resource was created */
  latitude?: number;
  /** Longitude where resource was created */
  longitude?: number;
  /** Altitude where resource was created */
  altitude?: number;
  /** Camera make (for photos) */
  cameraMake?: string;
  /** Camera model (for photos) */
  cameraModel?: string;
  /** Whether attachment should be treated as separate file */
  attachment?: boolean;
  /** Original filename */
  fileName?: string;
}

/**
 * Resource (attachment) in an Evernote note.
 */
export interface EnexResource {
  /** Base64-encoded file data */
  data: string;
  /** Encoding type (usually "base64") */
  encoding: string;
  /** MIME type of the resource */
  mime: string;
  /** Width in pixels (for images) */
  width?: number;
  /** Height in pixels (for images) */
  height?: number;
  /** Duration in seconds (for audio/video) */
  duration?: number;
  /** Resource attributes */
  resourceAttributes?: EnexResourceAttributes;
  /** Recognition data (OCR results) */
  recognition?: string;
  /** Alternate data (e.g., thumbnail) */
  alternateData?: {
    data: string;
    encoding: string;
  };
}

/**
 * Note attributes from an Evernote note.
 */
export interface EnexNoteAttributes {
  /** URL the note was clipped from */
  sourceUrl?: string;
  /** Application that created the note */
  sourceApplication?: string;
  /** Latitude where note was created */
  latitude?: number;
  /** Longitude where note was created */
  longitude?: number;
  /** Altitude where note was created */
  altitude?: number;
  /** Author of the note */
  author?: string;
  /** Source of the note (e.g., "web.clip") */
  source?: string;
  /** Whether this is a reminder */
  reminderOrder?: number;
  /** When reminder should fire */
  reminderTime?: string;
  /** When reminder was done */
  reminderDoneTime?: string;
  /** Place name */
  placeName?: string;
  /** Content class (e.g., "yinxiang.note") */
  contentClass?: string;
  /** Subject date */
  subjectDate?: string;
}

/**
 * A single note from an ENEX file.
 */
export interface EnexNote {
  /** Note title */
  title: string;
  /** Note content in ENML format (wrapped in CDATA) */
  content: string;
  /** Creation timestamp (ISO 8601 format) */
  created?: string;
  /** Last update timestamp (ISO 8601 format) */
  updated?: string;
  /** Tags assigned to the note */
  tags: string[];
  /** Note attributes */
  noteAttributes?: EnexNoteAttributes;
  /** Resources (attachments) */
  resources: EnexResource[];
}

/**
 * Parsed ENEX export file.
 */
export interface EnexExport {
  /** Export date (ISO 8601 format) */
  exportDate?: string;
  /** Application that created the export */
  application?: string;
  /** Application version */
  version?: string;
  /** Notes in the export */
  notes: EnexNote[];
}

/**
 * Hash map for looking up resources by their MD5 hash.
 * Used to replace en-media references with actual URLs.
 */
export type ResourceHashMap = Map<
  string,
  {
    url: string;
    mimeType: string;
    filename?: string;
  }
>;
