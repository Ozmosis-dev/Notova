/**
 * Attachments API Route
 * 
 * Upload and list attachments for notes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStorageService } from '@/lib/storage';
import { createHash } from 'crypto';

/**
 * GET /api/attachments
 * 
 * List attachments, optionally filtered by note.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const noteId = searchParams.get('noteId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 401 }
            );
        }

        const where: Record<string, unknown> = {
            note: {
                notebook: { userId },
            },
        };

        if (noteId) {
            where.noteId = noteId;
        }

        const attachments = await prisma.attachment.findMany({
            where,
            include: {
                note: {
                    select: { id: true, title: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Get URLs for attachments
        const storage = getStorageService();
        const result = await Promise.all(
            attachments.map(async (attachment) => ({
                id: attachment.id,
                filename: attachment.filename,
                originalName: attachment.originalName,
                mimeType: attachment.mimeType,
                size: attachment.size,
                width: attachment.width,
                height: attachment.height,
                url: await storage.getUrl(attachment.storageKey),
                note: attachment.note,
                createdAt: attachment.createdAt,
            }))
        );

        return NextResponse.json({ attachments: result });
    } catch (error) {
        console.error('Error listing attachments:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to list attachments' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/attachments
 * 
 * Upload a new attachment to a note.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const file = formData.get('file') as File | null;
        const noteId = formData.get('noteId') as string | null;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 401 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!noteId) {
            return NextResponse.json(
                { error: 'Note ID required' },
                { status: 400 }
            );
        }

        // Verify note belongs to user
        const note = await prisma.note.findFirst({
            where: {
                id: noteId,
                notebook: { userId },
            },
        });

        if (!note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        // Check file size (limit to 25MB)
        const MAX_SIZE = 25 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 25MB.' },
                { status: 413 }
            );
        }

        // Read file data
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Calculate hash
        const hash = createHash('md5').update(buffer).digest('hex');

        // Generate storage key
        const ext = file.name.split('.').pop() || 'bin';
        const filename = `${file.name.replace(/\.[^.]+$/, '')}_${hash.substring(0, 8)}.${ext}`;
        const storageKey = `attachments/${userId}/${noteId}/${filename}`;

        // Upload to storage
        const storage = getStorageService();
        await storage.upload(buffer, {
            key: storageKey,
            mimeType: file.type || 'application/octet-stream',
            filename: file.name,
        });

        // Create attachment record
        const attachment = await prisma.attachment.create({
            data: {
                noteId,
                filename,
                originalName: file.name,
                mimeType: file.type || 'application/octet-stream',
                size: file.size,
                storageKey,
                hash,
            },
        });

        // Get URL
        const url = await storage.getUrl(storageKey);

        return NextResponse.json({
            id: attachment.id,
            filename: attachment.filename,
            originalName: attachment.originalName,
            mimeType: attachment.mimeType,
            size: attachment.size,
            url,
            createdAt: attachment.createdAt,
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading attachment:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload attachment' },
            { status: 500 }
        );
    }
}
