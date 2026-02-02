/**
 * Individual Note API Route
 * 
 * Get, update, and delete operations for a specific note.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const updateNoteSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    icon: z.string().max(10).nullable().optional(),
    cardColor: z.enum(['default', 'black', 'gold', 'orange', 'taupe', 'olive', 'blue', 'purple', 'red', 'navy', 'pink']).nullable().optional(),
    content: z.string().optional(),
    notebookId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    addTags: z.array(z.string()).optional(),
    removeTags: z.array(z.string()).optional(),
    isTrash: z.boolean().optional(),
    isFavorite: z.boolean().optional(),
});

/**
 * Helper to get authenticated user ID from session
 */
async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

/**
 * GET /api/notes/[id]
 * 
 * Get a specific note with full content.
 */
export async function GET(
    _request: NextRequest,
    { params }: RouteParams
) {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;

        const note = await prisma.note.findFirst({
            where: {
                id,
                notebook: { userId },
            },
            include: {
                notebook: { select: { id: true, name: true } },
                tags: {
                    include: {
                        tag: { select: { id: true, name: true } },
                    },
                },
                attachments: {
                    select: {
                        id: true,
                        filename: true,
                        originalName: true,
                        mimeType: true,
                        size: true,
                        width: true,
                        height: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: note.id,
            title: note.title,
            icon: note.icon,
            cardColor: note.cardColor,
            content: note.content,
            originalEnml: note.originalEnml,
            notebook: note.notebook,
            tags: note.tags.map((nt: { tag: { id: string; name: string } }) => nt.tag),
            attachments: note.attachments,
            sourceUrl: note.sourceUrl,
            author: note.author,
            latitude: note.latitude,
            longitude: note.longitude,
            isTrash: note.isTrash,
            isFavorite: note.isFavorite,
            trashedAt: note.trashedAt,
            evernoteCreated: note.evernoteCreated,
            evernoteUpdated: note.evernoteUpdated,
            importedAt: note.importedAt,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch note' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notes/[id]
 * 
 * Update a specific note.
 */
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();

        // Validate input
        const parseResult = updateNoteSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        // Check if note exists and belongs to user
        const existing = await prisma.note.findFirst({
            where: {
                id,
                notebook: { userId },
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        const { title, icon, cardColor, content, notebookId, tags, addTags, removeTags, isTrash, isFavorite } = parseResult.data;

        // If changing notebook, verify new notebook belongs to user
        if (notebookId && notebookId !== existing.notebookId) {
            const notebook = await prisma.notebook.findFirst({
                where: { id: notebookId, userId },
            });
            if (!notebook) {
                return NextResponse.json(
                    { error: 'Notebook not found' },
                    { status: 404 }
                );
            }
        }

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (title !== undefined) updateData.title = title;
        if (icon !== undefined) updateData.icon = icon;
        if (cardColor !== undefined) updateData.cardColor = cardColor;
        if (content !== undefined) {
            updateData.content = content;
            updateData.contentPlaintext = extractPlainText(content);
        }
        if (notebookId !== undefined) updateData.notebookId = notebookId;
        if (isTrash !== undefined) {
            updateData.isTrash = isTrash;
            // Set or clear trashedAt based on trash state
            updateData.trashedAt = isTrash ? new Date() : null;
        }
        if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

        // Update note
        const note = await prisma.note.update({
            where: { id },
            data: updateData,
            include: {
                notebook: { select: { id: true, name: true } },
                tags: {
                    include: {
                        tag: { select: { id: true, name: true } },
                    },
                },
            },
        });

        // Handle tags update if provided - OPTIMIZED: Batch operations instead of N+1 queries
        if (tags !== undefined) {
            // Remove existing tags (single query)
            await prisma.noteTag.deleteMany({
                where: { noteId: id },
            });

            // Add new tags using batch operations
            if (tags.length > 0) {
                // Batch upsert all tags in parallel (reduces N queries to N parallel queries)
                const tagRecords = await Promise.all(
                    tags.map(tagName =>
                        prisma.tag.upsert({
                            where: { userId_name: { userId, name: tagName } },
                            create: { name: tagName, userId },
                            update: {},
                        })
                    )
                );

                // Batch create all note-tag relationships (single query instead of N)
                await prisma.noteTag.createMany({
                    data: tagRecords.map(tag => ({
                        noteId: id,
                        tagId: tag.id,
                    })),
                    skipDuplicates: true,
                });
            }
        }

        // Handle incremental tag additions - OPTIMIZED: Batch operations
        if (addTags && addTags.length > 0) {
            // Batch upsert all tags in parallel
            const tagRecords = await Promise.all(
                addTags.map(tagName =>
                    prisma.tag.upsert({
                        where: { userId_name: { userId, name: tagName } },
                        create: { name: tagName, userId },
                        update: {},
                    })
                )
            );

            // Batch create note-tag relationships (skipDuplicates handles existing)
            await prisma.noteTag.createMany({
                data: tagRecords.map(tag => ({
                    noteId: id,
                    tagId: tag.id,
                })),
                skipDuplicates: true,
            });
        }

        // Handle incremental tag removals (already optimized - single query)
        if (removeTags && removeTags.length > 0) {
            await prisma.noteTag.deleteMany({
                where: {
                    noteId: id,
                    tagId: { in: removeTags },
                },
            });
        }

        // If any tag operation was performed, fetch updated tags
        if (tags !== undefined || addTags || removeTags) {
            // Fetch updated tags
            const updatedNoteTags = await prisma.noteTag.findMany({
                where: { noteId: id },
                include: { tag: { select: { id: true, name: true } } },
            });

            return NextResponse.json({
                id: note.id,
                title: note.title,
                content: note.content,
                notebook: note.notebook,
                tags: updatedNoteTags.map((nt: { tag: { id: string; name: string } }) => nt.tag),
                isTrash: note.isTrash,
                isFavorite: note.isFavorite,
                updatedAt: note.updatedAt,
            });
        }

        return NextResponse.json({
            id: note.id,
            title: note.title,
            content: note.content,
            notebook: note.notebook,
            tags: note.tags.map((nt: { tag: { id: string; name: string } }) => nt.tag),
            isTrash: note.isTrash,
            isFavorite: note.isFavorite,
            updatedAt: note.updatedAt,
        });
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update note' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/notes/[id]
 * 
 * Delete a specific note (moves to trash or permanently deletes).
 */
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const { searchParams } = new URL(request.url);
        const permanent = searchParams.get('permanent') === 'true';

        // Check if note exists and belongs to user
        const existing = await prisma.note.findFirst({
            where: {
                id,
                notebook: { userId },
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        if (permanent || existing.isTrash) {
            // Permanently delete note and all related data
            await prisma.attachment.deleteMany({
                where: { noteId: id },
            });
            await prisma.noteTag.deleteMany({
                where: { noteId: id },
            });
            await prisma.note.delete({
                where: { id },
            });

            return NextResponse.json({ success: true, permanent: true });
        } else {
            // Move to trash
            await prisma.note.update({
                where: { id },
                data: {
                    isTrash: true,
                    trashedAt: new Date(),
                },
            });

            return NextResponse.json({ success: true, permanent: false });
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete note' },
            { status: 500 }
        );
    }
}

/**
 * Extract plain text from HTML content.
 */
function extractPlainText(html: string): string {
    let text = html.replace(/<[^>]+>/g, ' ');
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    return text.replace(/\s+/g, ' ').trim();
}
