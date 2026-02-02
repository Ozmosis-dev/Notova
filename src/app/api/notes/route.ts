/**
 * Notes API Route
 * 
 * CRUD operations for notes with filtering and pagination.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getAuthUserId, ensureDbUser } from '@/lib/supabase/server';

// Validation schemas
const createNoteSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string(),
    notebookId: z.string(),
    tags: z.array(z.string()).optional(),
});

const listNotesQuerySchema = z.object({
    notebookId: z.string().optional(),
    tagId: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('updatedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    isTrash: z.enum(['true', 'false']).optional(),
});

/**
 * GET /api/notes
 * 
 * List notes with filtering, search, and pagination.
 */
export async function GET(request: NextRequest) {
    try {
        // Get authenticated user from session
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        // Parse and validate query params
        const queryParams = {
            notebookId: searchParams.get('notebookId') || undefined,
            tagId: searchParams.get('tagId') || undefined,
            search: searchParams.get('search') || undefined,
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20',
            sortBy: searchParams.get('sortBy') || 'updatedAt',
            sortOrder: searchParams.get('sortOrder') || 'desc',
            isTrash: searchParams.get('isTrash') || undefined,
        };

        const parseResult = listNotesQuerySchema.safeParse(queryParams);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { notebookId, tagId, search, page, limit, sortBy, sortOrder, isTrash } = parseResult.data;

        // Build where clause
        const where: Record<string, unknown> = {
            notebook: { userId },
        };

        if (notebookId) {
            where.notebookId = notebookId;
        }

        if (tagId) {
            where.tags = {
                some: { tagId },
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { contentPlaintext: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (isTrash !== undefined) {
            where.isTrash = isTrash === 'true';
        } else {
            where.isTrash = false; // Default to non-trashed
        }

        // Count total for pagination
        const total = await prisma.note.count({ where });

        // Fetch notes with pagination
        const notes = await prisma.note.findMany({
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
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        });

        // Transform notes for response
        const result = notes.map((note) => ({
            id: note.id,
            title: note.title,
            icon: note.icon,
            cardColor: note.cardColor,
            preview: note.contentPlaintext?.substring(0, 200) || '',
            notebook: note.notebook,
            tags: note.tags.map((nt: { tag: { id: string; name: string } }) => nt.tag),
            attachmentCount: note._count.attachments,
            isTrash: note.isTrash,
            isFavorite: note.isFavorite,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        }));

        return NextResponse.json({
            notes: result,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error listing notes:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to list notes' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/notes
 * 
 * Create a new note.
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user and ensure they exist in database
        const userId = await ensureDbUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const parseResult = createNoteSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { title, content, notebookId, tags } = parseResult.data;

        // Verify notebook belongs to user
        const notebook = await prisma.notebook.findFirst({
            where: { id: notebookId, userId },
        });

        if (!notebook) {
            return NextResponse.json(
                { error: 'Notebook not found' },
                { status: 404 }
            );
        }

        // Extract plain text for search
        const contentPlaintext = extractPlainText(content);

        // Create note with tags
        const note = await prisma.note.create({
            data: {
                title,
                content,
                contentPlaintext,
                notebookId,
                tags: tags && tags.length > 0 ? {
                    create: await Promise.all(
                        tags.map(async (tagName) => {
                            // Get or create tag
                            const tag = await prisma.tag.upsert({
                                where: { userId_name: { userId, name: tagName } },
                                create: { name: tagName, userId },
                                update: {},
                            });
                            return { tagId: tag.id };
                        })
                    ),
                } : undefined,
            },
            include: {
                notebook: { select: { id: true, name: true } },
                tags: {
                    include: {
                        tag: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return NextResponse.json({
            id: note.id,
            title: note.title,
            content: note.content,
            notebook: note.notebook,
            tags: note.tags.map((nt: { tag: { id: string; name: string } }) => nt.tag),
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create note' },
            { status: 500 }
        );
    }
}

/**
 * Extract plain text from HTML content.
 */
function extractPlainText(html: string): string {
    // Remove HTML tags
    let text = html.replace(/<[^>]+>/g, ' ');
    // Decode entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
    // Normalize whitespace
    return text.replace(/\s+/g, ' ').trim();
}
