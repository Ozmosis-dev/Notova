/**
 * Individual Notebook API Route
 * 
 * Get, update, and delete operations for a specific notebook.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const updateNotebookSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    icon: z.string().max(10).nullable().optional(),
    cardColor: z.string().max(20).nullable().optional(),
    isDefault: z.boolean().optional(),
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
 * GET /api/notebooks/[id]
 * 
 * Get a specific notebook.
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

        const notebook = await prisma.notebook.findFirst({
            where: { id, userId },
            include: {
                _count: {
                    select: { notes: true },
                },
            },
        });

        if (!notebook) {
            return NextResponse.json(
                { error: 'Notebook not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: notebook.id,
            name: notebook.name,
            icon: notebook.icon,
            cardColor: notebook.cardColor,
            isDefault: notebook.isDefault,
            noteCount: notebook._count.notes,
            createdAt: notebook.createdAt,
            updatedAt: notebook.updatedAt,
        });
    } catch (error) {
        console.error('Error fetching notebook:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch notebook' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/notebooks/[id]
 * 
 * Update a specific notebook.
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
        const parseResult = updateNotebookSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        // Check if notebook exists and belongs to user
        const existing = await prisma.notebook.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Notebook not found' },
                { status: 404 }
            );
        }

        const { name, icon, cardColor, isDefault } = parseResult.data;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.notebook.updateMany({
                where: { userId, isDefault: true, NOT: { id } },
                data: { isDefault: false },
            });
        }

        const notebook = await prisma.notebook.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(icon !== undefined && { icon }),
                ...(cardColor !== undefined && { cardColor }),
                ...(isDefault !== undefined && { isDefault }),
            },
        });

        return NextResponse.json(notebook);
    } catch (error) {
        console.error('Error updating notebook:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update notebook' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/notebooks/[id]
 * 
 * Delete a specific notebook.
 * Notes in the notebook will be moved to trash or deleted.
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
        const deleteNotes = searchParams.get('deleteNotes') === 'true';

        // Check if notebook exists and belongs to user
        const existing = await prisma.notebook.findFirst({
            where: { id, userId },
            include: {
                _count: { select: { notes: true } },
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Notebook not found' },
                { status: 404 }
            );
        }

        // Don't allow deleting the default notebook if it has notes
        if (existing.isDefault && existing._count.notes > 0 && !deleteNotes) {
            return NextResponse.json(
                { error: 'Cannot delete default notebook with notes. Move notes first or set deleteNotes=true.' },
                { status: 400 }
            );
        }

        // If deleteNotes is false, we need to handle the notes
        if (!deleteNotes && existing._count.notes > 0) {
            // Find or create a default notebook to move notes to
            let defaultNotebook = await prisma.notebook.findFirst({
                where: { userId, isDefault: true, NOT: { id } },
            });

            if (!defaultNotebook) {
                defaultNotebook = await prisma.notebook.create({
                    data: {
                        name: 'Default',
                        isDefault: true,
                        userId,
                    },
                });
            }

            // Move notes to the default notebook
            await prisma.note.updateMany({
                where: { notebookId: id },
                data: { notebookId: defaultNotebook.id },
            });
        } else if (deleteNotes) {
            // Delete all notes and their attachments
            const notes = await prisma.note.findMany({
                where: { notebookId: id },
                select: { id: true },
            });

            for (const note of notes) {
                // Delete attachments
                await prisma.attachment.deleteMany({
                    where: { noteId: note.id },
                });
                // Delete note tags
                await prisma.noteTag.deleteMany({
                    where: { noteId: note.id },
                });
            }

            // Delete notes
            await prisma.note.deleteMany({
                where: { notebookId: id },
            });
        }

        // Delete the notebook
        await prisma.notebook.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notebook:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete notebook' },
            { status: 500 }
        );
    }
}
