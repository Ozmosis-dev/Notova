/**
 * Clear Trash API Route
 * 
 * Permanently delete all trashed notes.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

/**
 * Helper to get authenticated user ID from session
 */
async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

/**
 * DELETE /api/notes/trash/clear
 * 
 * Permanently delete all notes in trash for the authenticated user.
 */
export async function DELETE() {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Find all trashed notes for this user
        const trashedNotes = await prisma.note.findMany({
            where: {
                isTrash: true,
                notebook: { userId },
            },
            select: { id: true },
        });

        const noteIds = trashedNotes.map(n => n.id);

        if (noteIds.length === 0) {
            return NextResponse.json({ success: true, deletedCount: 0 });
        }

        // Delete related data first
        await prisma.attachment.deleteMany({
            where: { noteId: { in: noteIds } },
        });
        await prisma.noteTag.deleteMany({
            where: { noteId: { in: noteIds } },
        });

        // Delete the notes
        const result = await prisma.note.deleteMany({
            where: { id: { in: noteIds } },
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.count
        });
    } catch (error) {
        console.error('Error clearing trash:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to clear trash' },
            { status: 500 }
        );
    }
}
