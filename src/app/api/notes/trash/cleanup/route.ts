/**
 * Trash Cleanup API Route
 * 
 * Delete notes that have been in trash for more than 30 days.
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
 * POST /api/notes/trash/cleanup
 * 
 * Delete all notes that have been in trash for more than 30 days.
 * This can be called manually or via a scheduled job.
 */
export async function POST() {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Calculate cutoff date (30 days ago)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        // Find all expired trashed notes for this user
        const expiredNotes = await prisma.note.findMany({
            where: {
                isTrash: true,
                trashedAt: {
                    lt: cutoffDate,
                },
                notebook: { userId },
            },
            select: { id: true },
        });

        const noteIds = expiredNotes.map(n => n.id);

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
            deletedCount: result.count,
            message: `Deleted ${result.count} notes that were in trash for more than 30 days`
        });
    } catch (error) {
        console.error('Error cleaning up trash:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to cleanup trash' },
            { status: 500 }
        );
    }
}
