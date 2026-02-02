/**
 * Individual Attachment API Route
 * 
 * Get, download, and delete operations for a specific attachment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStorageService } from '@/lib/storage';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * Helper to get authenticated user ID from session
 */
async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

/**
 * GET /api/attachments/[id]
 * 
 * Get attachment metadata and download URL.
 */
export async function GET(
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
        const download = searchParams.get('download') === 'true';

        const attachment = await prisma.attachment.findFirst({
            where: {
                id,
                note: {
                    notebook: { userId },
                },
            },
            include: {
                note: { select: { id: true, title: true } },
            },
        });

        if (!attachment) {
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            );
        }

        const storage = getStorageService();

        // If download requested, stream the file
        if (download) {
            const data = await storage.get(attachment.storageKey);
            if (!data) {
                return NextResponse.json(
                    { error: 'File not found in storage' },
                    { status: 404 }
                );
            }

            return new NextResponse(new Uint8Array(data), {
                headers: {
                    'Content-Type': attachment.mimeType,
                    'Content-Disposition': `attachment; filename="${attachment.originalName || attachment.filename}"`,
                    'Content-Length': String(data.length),
                },
            });
        }

        // Return metadata with URL
        const url = await storage.getUrl(attachment.storageKey);

        return NextResponse.json({
            id: attachment.id,
            filename: attachment.filename,
            originalName: attachment.originalName,
            mimeType: attachment.mimeType,
            size: attachment.size,
            width: attachment.width,
            height: attachment.height,
            hash: attachment.hash,
            url,
            note: attachment.note,
            createdAt: attachment.createdAt,
        });
    } catch (error) {
        console.error('Error fetching attachment:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch attachment' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/attachments/[id]
 * 
 * Delete an attachment.
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

        const attachment = await prisma.attachment.findFirst({
            where: {
                id,
                note: {
                    notebook: { userId },
                },
            },
        });

        if (!attachment) {
            return NextResponse.json(
                { error: 'Attachment not found' },
                { status: 404 }
            );
        }

        // Delete from storage
        const storage = getStorageService();
        await storage.delete(attachment.storageKey);

        // Delete from database
        await prisma.attachment.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete attachment' },
            { status: 500 }
        );
    }
}
