/**
 * Individual Tag API Route
 * 
 * Get, update, and delete operations for a specific tag.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const updateTagSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
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
 * GET /api/tags/[id]
 * 
 * Get a specific tag with its notes.
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

        const tag = await prisma.tag.findFirst({
            where: { id, userId },
            include: {
                notes: {
                    include: {
                        note: {
                            select: {
                                id: true,
                                title: true,
                                contentPlaintext: true,
                                createdAt: true,
                                updatedAt: true,
                                isTrash: true,
                            },
                        },
                    },
                    where: {
                        note: { isTrash: false },
                    },
                },
                _count: {
                    select: { notes: true },
                },
            },
        });

        if (!tag) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            noteCount: tag._count.notes,
            notes: tag.notes.map((nt: { note: { id: string; title: string; contentPlaintext: string | null; createdAt: Date; updatedAt: Date } }) => ({
                id: nt.note.id,
                title: nt.note.title,
                preview: nt.note.contentPlaintext?.substring(0, 200) || '',
                createdAt: nt.note.createdAt,
                updatedAt: nt.note.updatedAt,
            })),
            createdAt: tag.createdAt,
        });
    } catch (error) {
        console.error('Error fetching tag:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch tag' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/tags/[id]
 * 
 * Update a specific tag.
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
        const parseResult = updateTagSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        // Check if tag exists and belongs to user
        const existing = await prisma.tag.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        const { name, color } = parseResult.data;

        // Check for duplicate name if changing
        if (name && name !== existing.name) {
            const duplicate = await prisma.tag.findFirst({
                where: { userId, name, NOT: { id } },
            });
            if (duplicate) {
                return NextResponse.json(
                    { error: 'Tag with this name already exists' },
                    { status: 409 }
                );
            }
        }

        const tag = await prisma.tag.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(color !== undefined && { color }),
            },
            include: {
                _count: { select: { notes: true } },
            },
        });

        return NextResponse.json({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            noteCount: tag._count.notes,
        });
    } catch (error) {
        console.error('Error updating tag:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update tag' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/tags/[id]
 * 
 * Delete a specific tag.
 * Notes with this tag will have the tag removed, not deleted.
 */
export async function DELETE(
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

        // Check if tag exists and belongs to user
        const existing = await prisma.tag.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Tag not found' },
                { status: 404 }
            );
        }

        // Delete all note-tag associations
        await prisma.noteTag.deleteMany({
            where: { tagId: id },
        });

        // Delete the tag
        await prisma.tag.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete tag' },
            { status: 500 }
        );
    }
}
