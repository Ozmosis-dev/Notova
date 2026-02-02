/**
 * Import Orchestrator
 * 
 * Coordinates the full ENEX import process:
 * 1. Parse ENEX file
 * 2. Create or get default notebook
 * 3. Process notes in batches
 * 4. Extract and store resources
 * 5. Convert ENML to HTML
 * 6. Create database records
 * 7. Track progress and handle errors
 */

import { prisma } from '@/lib/db';
import { parseEnexString, parseEnexBuffer } from './enex-parser';
import { convertEnmlToHtml, extractPlainText } from './enml-converter';
import { extractResources } from './resource-extractor';
import type { EnexNote, EnexExport } from '@/types/enex';
import { parseEvernoteDate } from '@/lib/utils';

/**
 * Import job status.
 */
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Progress callback for import operations.
 */
export type ImportProgressCallback = (progress: ImportProgress) => void;

/**
 * Import progress information.
 */
export interface ImportProgress {
    status: ImportStatus;
    totalNotes: number;
    imported: number;
    failed: number;
    currentNote?: string;
    errors: string[];
}

/**
 * Options for import operation.
 */
export interface ImportOptions {
    /** User ID performing the import */
    userId: string;
    /** Filename of the ENEX file */
    filename: string;
    /** Notebook ID to import into (optional - will create default if not provided) */
    notebookId?: string;
    /** Notebook name to create/use (optional - defaults to "Imported Notes") */
    notebookName?: string;
    /** Progress callback */
    onProgress?: ImportProgressCallback;
    /** Batch size for processing notes */
    batchSize?: number;
}

/**
 * Result of an import operation.
 */
export interface ImportResult {
    jobId: string;
    status: ImportStatus;
    totalNotes: number;
    imported: number;
    failed: number;
    errors: string[];
    notebookId: string;
}

/**
 * Import ENEX content into the database.
 */
export async function importEnex(
    content: string | Buffer,
    options: ImportOptions
): Promise<ImportResult> {
    const {
        userId,
        filename,
        notebookId,
        notebookName = 'Imported Notes',
        onProgress,
        batchSize = 10,
    } = options;

    // Create import job record
    const importJob = await prisma.importJob.create({
        data: {
            userId,
            filename,
            status: 'pending',
        },
    });

    const progress: ImportProgress = {
        status: 'pending',
        totalNotes: 0,
        imported: 0,
        failed: 0,
        errors: [],
    };

    const updateProgress = (updates: Partial<ImportProgress>) => {
        Object.assign(progress, updates);
        onProgress?.(progress);
    };

    try {
        // Parse ENEX content
        updateProgress({ status: 'processing' });

        const enexExport: EnexExport = typeof content === 'string'
            ? parseEnexString(content)
            : parseEnexBuffer(content);

        const totalNotes = enexExport.notes.length;
        updateProgress({ totalNotes });

        // Update job with total notes
        await prisma.importJob.update({
            where: { id: importJob.id },
            data: {
                status: 'processing',
                totalNotes,
                startedAt: new Date(),
            },
        });

        if (totalNotes === 0) {
            await prisma.importJob.update({
                where: { id: importJob.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                },
            });

            return {
                jobId: importJob.id,
                status: 'completed',
                totalNotes: 0,
                imported: 0,
                failed: 0,
                errors: [],
                notebookId: notebookId || '',
            };
        }

        // Get or create notebook
        const notebook = await getOrCreateNotebook(userId, notebookId, notebookName);

        // Process notes in batches
        for (let i = 0; i < enexExport.notes.length; i += batchSize) {
            const batch = enexExport.notes.slice(i, i + batchSize);

            for (const note of batch) {
                try {
                    updateProgress({ currentNote: note.title });
                    await importNote(note, {
                        userId,
                        notebookId: notebook.id,
                        importJobId: importJob.id,
                    });

                    progress.imported++;
                    updateProgress({});

                    // Update job progress
                    await prisma.importJob.update({
                        where: { id: importJob.id },
                        data: { imported: progress.imported },
                    });
                } catch (error) {
                    progress.failed++;
                    const errorMessage = `Failed to import "${note.title}": ${error instanceof Error ? error.message : 'Unknown error'
                        }`;
                    progress.errors.push(errorMessage);
                    updateProgress({});

                    // Update job with error
                    await prisma.importJob.update({
                        where: { id: importJob.id },
                        data: {
                            failed: progress.failed,
                            errors: progress.errors,
                        },
                    });

                    console.error(errorMessage);
                }
            }
        }

        // Mark job as completed
        const finalStatus: ImportStatus = progress.failed === totalNotes ? 'failed' : 'completed';

        await prisma.importJob.update({
            where: { id: importJob.id },
            data: {
                status: finalStatus,
                completedAt: new Date(),
            },
        });

        updateProgress({ status: finalStatus, currentNote: undefined });

        return {
            jobId: importJob.id,
            status: finalStatus,
            totalNotes,
            imported: progress.imported,
            failed: progress.failed,
            errors: progress.errors,
            notebookId: notebook.id,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        await prisma.importJob.update({
            where: { id: importJob.id },
            data: {
                status: 'failed',
                completedAt: new Date(),
                errors: [errorMessage],
            },
        });

        updateProgress({
            status: 'failed',
            errors: [errorMessage],
        });

        return {
            jobId: importJob.id,
            status: 'failed',
            totalNotes: progress.totalNotes,
            imported: progress.imported,
            failed: progress.failed,
            errors: [errorMessage],
            notebookId: '',
        };
    }
}

/**
 * Get existing notebook or create a new one.
 */
async function getOrCreateNotebook(
    userId: string,
    notebookId?: string,
    notebookName = 'Imported Notes'
) {
    // If notebook ID provided, verify it exists and belongs to user
    if (notebookId) {
        const existing = await prisma.notebook.findFirst({
            where: { id: notebookId, userId },
        });
        if (existing) return existing;
    }

    // Look for existing notebook with same name
    const existingByName = await prisma.notebook.findFirst({
        where: { userId, name: notebookName },
    });
    if (existingByName) return existingByName;

    // Create new notebook
    return prisma.notebook.create({
        data: {
            name: notebookName,
            userId,
        },
    });
}

/**
 * Import a single note.
 */
async function importNote(
    enexNote: EnexNote,
    options: {
        userId: string;
        notebookId: string;
        importJobId: string;
    }
) {
    const { userId, notebookId, importJobId } = options;

    // Generate a temporary note ID for resource storage
    const tempNoteId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Extract resources first (we need the hash map for ENML conversion)
    const { extracted, hashMap, errors: resourceErrors } = await extractResources(
        enexNote.resources,
        {
            userId,
            noteId: tempNoteId,
            importJobId,
        }
    );

    if (resourceErrors.length > 0) {
        console.warn(`Resource extraction warnings for "${enexNote.title}":`, resourceErrors);
    }

    // Convert ENML to HTML
    const htmlContent = convertEnmlToHtml(enexNote.content, { resourceMap: hashMap });
    const plainTextContent = extractPlainText(enexNote.content);

    // Parse Evernote dates
    const evernoteCreated = enexNote.created ? parseEvernoteDate(enexNote.created) : null;
    const evernoteUpdated = enexNote.updated ? parseEvernoteDate(enexNote.updated) : null;

    // Create note in database
    const note = await prisma.note.create({
        data: {
            title: enexNote.title,
            content: htmlContent,
            contentPlaintext: plainTextContent,
            originalEnml: enexNote.content,
            notebookId,
            sourceUrl: enexNote.noteAttributes?.sourceUrl,
            author: enexNote.noteAttributes?.author,
            latitude: enexNote.noteAttributes?.latitude,
            longitude: enexNote.noteAttributes?.longitude,
            altitude: enexNote.noteAttributes?.altitude,
            evernoteCreated,
            evernoteUpdated,
            importedAt: new Date(),
            importSource: 'enex',
        },
    });

    // Create attachments in database (linked to the actual note)
    if (extracted.length > 0) {
        await prisma.attachment.createMany({
            data: extracted.map((resource) => ({
                noteId: note.id,
                filename: resource.filename,
                originalName: resource.filename,
                mimeType: resource.mimeType,
                size: resource.size,
                storageKey: resource.storageKey,
                hash: resource.hash,
                width: resource.width,
                height: resource.height,
            })),
        });
    }

    // Create/link tags
    if (enexNote.tags.length > 0) {
        for (const tagName of enexNote.tags) {
            // Get or create tag
            const tag = await prisma.tag.upsert({
                where: {
                    userId_name: { userId, name: tagName },
                },
                create: {
                    name: tagName,
                    userId,
                },
                update: {},
            });

            // Link tag to note
            await prisma.noteTag.create({
                data: {
                    noteId: note.id,
                    tagId: tag.id,
                },
            });
        }
    }

    return note;
}

/**
 * Get import job status.
 */
export async function getImportJobStatus(jobId: string) {
    return prisma.importJob.findUnique({
        where: { id: jobId },
    });
}

/**
 * List import jobs for a user.
 */
export async function listImportJobs(userId: string, limit = 10) {
    return prisma.importJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}
