/**
 * Combined App Data API Route
 * 
 * Returns notebooks, tags, and initial notes in a single request
 * to reduce waterfall requests on initial page load.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';

/**
 * GET /api/app-data
 * 
 * Fetch all initial app data in a single request.
 * Reduces 3 API calls to 1 for faster initial load.
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const notebookId = searchParams.get('notebookId') || undefined;
        const tagId = searchParams.get('tagId') || undefined;
        const isTrash = searchParams.get('isTrash') === 'true';

        // Execute all queries in parallel for maximum performance
        const [notebooks, tags, notes] = await Promise.all([
            // Fetch notebooks with note counts
            prisma.notebook.findMany({
                where: { userId },
                include: {
                    _count: {
                        select: { notes: { where: { isTrash: false } } },
                    },
                },
                orderBy: [
                    { isDefault: 'desc' },
                    { name: 'asc' },
                ],
            }),

            // Fetch tags with note counts
            prisma.tag.findMany({
                where: { userId },
                include: {
                    _count: {
                        select: { notes: true },
                    },
                },
                orderBy: { name: 'asc' },
            }),

            // Fetch notes with filters
            (async () => {
                const where: Record<string, unknown> = {
                    notebook: { userId },
                    isTrash,
                };

                if (notebookId) {
                    where.notebookId = notebookId;
                }

                if (tagId) {
                    where.tags = {
                        some: { tagId },
                    };
                }

                // When no specific notebook filter is applied, fetch notes from each notebook
                // to ensure notebook preview cards have data to display
                if (!notebookId && !tagId && !isTrash) {
                    // Fetch all notebooks for this user first
                    const userNotebooks = await prisma.notebook.findMany({
                        where: { userId },
                        select: { id: true },
                    });

                    // Fetch top 4 notes from each notebook for previews
                    const notesPerNotebook = await Promise.all(
                        userNotebooks.map(nb =>
                            prisma.note.findMany({
                                where: {
                                    notebookId: nb.id,
                                    isTrash: false,
                                },
                                include: {
                                    notebook: {
                                        select: { id: true, name: true },
                                    },
                                    tags: {
                                        include: {
                                            tag: { select: { id: true, name: true } },
                                        },
                                    },
                                    _count: {
                                        select: { attachments: true },
                                    },
                                },
                                orderBy: { updatedAt: 'desc' },
                                take: 4, // Only need 4 for notebook preview cards
                            })
                        )
                    );

                    // Flatten and sort by updatedAt
                    return notesPerNotebook.flat().sort((a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    );
                }

                return prisma.note.findMany({
                    where,
                    include: {
                        notebook: {
                            select: { id: true, name: true },
                        },
                        tags: {
                            include: {
                                tag: { select: { id: true, name: true } },
                            },
                        },
                        _count: {
                            select: { attachments: true },
                        },
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 50, // Limit initial load for performance
                });
            })(),
        ]);

        // Smart Cleanup: Remove "My Notes" default notebook if user has created other notebooks
        // This handles the case where the user has moved on from the default state
        let filteredNotebooks = notebooks;

        // If we have more than one notebook, check if we should remove "My Notes"
        if (notebooks.length > 1) {
            // Find "My Notes" notebook (checking name is enough, it's the system default name)
            const myNotesIndex = notebooks.findIndex(nb => nb.name === 'My Notes');

            if (myNotesIndex !== -1) {
                const myNotes = notebooks[myNotesIndex];
                let shouldDelete = false;

                // Case 1: Strictly empty (active notes count is 0)
                if (myNotes && myNotes._count.notes === 0) {
                    shouldDelete = true;
                }
                // Case 2: Contains only empty/untitled notes (ghost notes from init)
                else if (myNotes) {
                    // Check the actual notes content to be safe
                    try {
                        const notesInMyNotes = await prisma.note.findMany({
                            where: {
                                notebookId: myNotes.id,
                                isTrash: false
                            },
                            select: {
                                title: true,
                                contentPlaintext: true,
                                content: true
                            }
                        });

                        // Only delete if ALL notes are effectively empty and named "Untitled"
                        if (notesInMyNotes.length > 0 && notesInMyNotes.every(n =>
                            n.title === 'Untitled' &&
                            (!n.contentPlaintext || n.contentPlaintext.trim() === '') &&
                            (!n.content || n.content.trim() === '' || n.content === '<p></p>' || n.content === '<p><br></p>')
                        )) {
                            shouldDelete = true;
                        }
                    } catch (err) {
                        console.error('Error checking notes in My Notes:', err);
                    }
                }

                if (shouldDelete && myNotes) {
                    const myNotesId = myNotes.id;

                    // Remove from the list returned to the client
                    filteredNotebooks = [
                        ...notebooks.slice(0, myNotesIndex),
                        ...notebooks.slice(myNotesIndex + 1)
                    ];

                    // Clean up from database asynchronously
                    try {
                        prisma.notebook.delete({
                            where: { id: myNotesId }
                        }).catch(err => {
                            console.error('Failed to cleanup default notebook:', err);
                        });
                    } catch (e) {
                        // Ignore sync errors
                    }
                }
            }
        }

        // Transform data for response - with explicit types
        interface NotebookWithCount {
            id: string;
            name: string;
            icon: string | null;
            cardColor: string | null;
            isDefault: boolean;
            _count: { notes: number };
            createdAt: Date;
            updatedAt: Date;
        }

        interface TagWithCount {
            id: string;
            name: string;
            color: string | null;
            _count: { notes: number };
            createdAt: Date;
        }

        interface NoteWithRelations {
            id: string;
            title: string;
            icon: string | null;
            cardColor: string | null;
            contentPlaintext: string | null;
            notebook: { id: string; name: string };
            tags: Array<{ tag: { id: string; name: string } }>;
            _count: { attachments: number };
            isTrash: boolean;
            isFavorite: boolean;
            createdAt: Date;
            updatedAt: Date;
        }

        const transformedNotebooks = (filteredNotebooks as NotebookWithCount[]).map((notebook) => ({
            id: notebook.id,
            name: notebook.name,
            icon: notebook.icon,
            cardColor: notebook.cardColor,
            isDefault: notebook.isDefault,
            noteCount: notebook._count.notes,
            createdAt: notebook.createdAt,
            updatedAt: notebook.updatedAt,
        }));

        const transformedTags = (tags as TagWithCount[]).map((tag) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            noteCount: tag._count.notes,
            createdAt: tag.createdAt,
        }));

        const transformedNotes = (notes as NoteWithRelations[]).map((note) => ({
            id: note.id,
            title: note.title,
            icon: note.icon,
            cardColor: note.cardColor,
            preview: note.contentPlaintext?.substring(0, 200) || '',
            notebookId: note.notebook.id, // For notebook filtering
            notebook: note.notebook,
            tags: note.tags.map((nt) => nt.tag),
            attachmentCount: note._count.attachments,
            isTrash: note.isTrash,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        }));

        return NextResponse.json({
            notebooks: transformedNotebooks,
            tags: transformedTags,
            notes: transformedNotes,
        });
    } catch (error) {
        console.error('Error fetching app data:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch app data' },
            { status: 500 }
        );
    }
}
