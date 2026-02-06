/**
 * AI Smart Tags Apply API Route
 * 
 * Applies selected tags to notes in bulk, creating tags if they don't exist.
 * This is much more efficient than making individual API calls for each tag/note pair.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';

interface ApplyTagsRequest {
    noteIds: string[];
    tagNames: string[];
}

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body: ApplyTagsRequest = await request.json();
        const { noteIds, tagNames } = body;

        // Validate input
        if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
            return NextResponse.json(
                { error: 'Note IDs are required' },
                { status: 400 }
            );
        }

        if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
            return NextResponse.json(
                { error: 'Tag names are required' },
                { status: 400 }
            );
        }

        // Verify note ownership through notebook relation
        const validNotes = await prisma.note.findMany({
            where: {
                id: { in: noteIds },
                notebook: { userId: userId },
                isTrash: false,
            },
            select: { id: true },
        });

        if (validNotes.length === 0) {
            return NextResponse.json(
                { error: 'No valid notes found' },
                { status: 404 }
            );
        }

        const validNoteIds = validNotes.map(n => n.id);

        // Use a transaction for atomicity
        const result = await prisma.$transaction(async (tx) => {
            const tagResults: { name: string; id: string; created: boolean }[] = [];

            // Process each tag
            for (const tagName of tagNames) {
                const normalizedName = tagName.trim().toLowerCase();

                // Try to find existing tag or create new one
                let tag = await tx.tag.findFirst({
                    where: {
                        userId: userId,
                        name: { equals: normalizedName, mode: 'insensitive' },
                    },
                });

                if (!tag) {
                    // Create the tag
                    tag = await tx.tag.create({
                        data: {
                            name: normalizedName,
                            userId: userId,
                        },
                    });
                    tagResults.push({ name: tag.name, id: tag.id, created: true });
                } else {
                    tagResults.push({ name: tag.name, id: tag.id, created: false });
                }

                // Get existing note-tag connections for this tag
                const existingConnections = await tx.noteTag.findMany({
                    where: {
                        tagId: tag.id,
                        noteId: { in: validNoteIds },
                    },
                    select: { noteId: true },
                });

                const existingNoteIds = new Set(existingConnections.map(c => c.noteId));

                // Filter to only notes that don't already have this tag
                const notesToConnect = validNoteIds.filter(noteId => !existingNoteIds.has(noteId));

                // Create connections in bulk using createMany
                if (notesToConnect.length > 0) {
                    await tx.noteTag.createMany({
                        data: notesToConnect.map(noteId => ({
                            noteId,
                            tagId: tag!.id,
                        })),
                        skipDuplicates: true,
                    });
                }
            }

            return {
                tagsProcessed: tagResults,
                notesUpdated: validNoteIds.length,
            };
        });

        return NextResponse.json({
            success: true,
            tagsApplied: result.tagsProcessed.length,
            notesUpdated: result.notesUpdated,
            details: result.tagsProcessed,
        });

    } catch (error) {
        console.error('Error applying smart tags:', error);

        return NextResponse.json(
            { error: 'Failed to apply tags. Please try again.' },
            { status: 500 }
        );
    }
}
