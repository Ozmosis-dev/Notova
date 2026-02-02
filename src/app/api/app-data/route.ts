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

        const transformedNotebooks = (notebooks as NotebookWithCount[]).map((notebook) => ({
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
