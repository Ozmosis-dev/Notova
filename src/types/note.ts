/**
 * TypeScript types for the Note application domain.
 * These types represent the application's data model.
 */

import type { Note, Notebook, Tag, Attachment, ImportJob } from "@prisma/client";

/**
 * Note with all related data loaded.
 */
export interface NoteWithRelations extends Note {
  notebook: Notebook;
  tags: Array<{
    tag: Tag;
  }>;
  attachments: Attachment[];
}

/**
 * Notebook with notes count.
 */
export interface NotebookWithCount extends Notebook {
  _count: {
    notes: number;
  };
}

/**
 * Tag with notes count.
 */
export interface TagWithCount extends Tag {
  _count: {
    notes: number;
  };
}

/**
 * Input for creating a new note.
 */
export interface CreateNoteInput {
  title: string;
  content: string;
  notebookId: string;
  tagIds?: string[];
  sourceUrl?: string;
  author?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

/**
 * Input for updating a note.
 */
export interface UpdateNoteInput {
  title?: string;
  content?: string;
  notebookId?: string;
  tagIds?: string[];
  sourceUrl?: string;
  author?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  isTrash?: boolean;
}

/**
 * Input for creating a new notebook.
 */
export interface CreateNotebookInput {
  name: string;
  isDefault?: boolean;
}

/**
 * Input for updating a notebook.
 */
export interface UpdateNotebookInput {
  name?: string;
  isDefault?: boolean;
}

/**
 * Filter options for listing notes.
 */
export interface NoteFilterOptions {
  notebookId?: string;
  tagId?: string;
  isTrash?: boolean;
  search?: string;
}

/**
 * Pagination options.
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated result.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Import job status enum-like type.
 */
export type ImportJobStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Import job with computed fields.
 */
export interface ImportJobWithProgress extends ImportJob {
  progress: number; // 0-100
}

/**
 * Import result summary.
 */
export interface ImportResult {
  jobId: string;
  status: ImportJobStatus;
  totalNotes: number;
  imported: number;
  failed: number;
  errors: string[];
}

/**
 * Re-export Prisma types for convenience.
 */
export type { Note, Notebook, Tag, Attachment, ImportJob };
