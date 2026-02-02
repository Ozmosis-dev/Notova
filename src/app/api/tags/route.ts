/**
 * Tags API Route
 * 
 * CRUD operations for tags.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureDbUser, getAuthUserId } from '@/lib/supabase/server';

// Validation schemas
const createTagSchema = z.object({
    name: z.string().min(1).max(100),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

/**
 * GET /api/tags
 * 
 * List all tags for the current user with note counts.
 */
export async function GET() {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const tags = await prisma.tag.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { notes: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Transform to include note count
        const result = tags.map((tag: { id: string; name: string; color: string | null; createdAt: Date; _count: { notes: number } }) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            noteCount: tag._count.notes,
            createdAt: tag.createdAt,
        }));

        return NextResponse.json({ tags: result });
    } catch (error) {
        console.error('Error listing tags:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to list tags' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tags
 * 
 * Create a new tag.
 */
export async function POST(request: NextRequest) {
    try {
        // Use ensureDbUser to auto-create User record if needed
        const userId = await ensureDbUser();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const parseResult = createTagSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { name, color } = parseResult.data;

        // Check if tag already exists
        const existing = await prisma.tag.findFirst({
            where: { userId, name },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Tag with this name already exists' },
                { status: 409 }
            );
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                color,
                userId,
            },
        });

        return NextResponse.json({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            noteCount: 0,
            createdAt: tag.createdAt,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating tag:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create tag' },
            { status: 500 }
        );
    }
}
