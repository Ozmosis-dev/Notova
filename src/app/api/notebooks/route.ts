/**
 * Notebooks API Route
 * 
 * CRUD operations for notebooks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ensureDbUser, getAuthUserId } from '@/lib/supabase/server';

// Validation schemas
const createNotebookSchema = z.object({
    name: z.string().min(1).max(255),
    isDefault: z.boolean().optional(),
    icon: z.string().optional(),
    cardColor: z.string().optional(),
});

/**
 * GET /api/notebooks
 * 
 * List all notebooks for the current user.
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

        const notebooks = await prisma.notebook.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { notes: true },
                },
            },
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' },
            ],
        });

        // Transform to include note count
        const result = notebooks.map((notebook) => ({
            id: notebook.id,
            name: notebook.name,
            icon: notebook.icon,
            cardColor: notebook.cardColor,
            isDefault: notebook.isDefault,
            noteCount: notebook._count.notes,
            createdAt: notebook.createdAt,
            updatedAt: notebook.updatedAt,
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error listing notebooks:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to list notebooks' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/notebooks
 * 
 * Create a new notebook.
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
        const parseResult = createNotebookSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parseResult.error.flatten() },
                { status: 400 }
            );
        }

        const { name, isDefault, icon, cardColor } = parseResult.data;

        // If setting as default, unset other defaults
        if (isDefault) {
            await prisma.notebook.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const notebook = await prisma.notebook.create({
            data: {
                name,
                isDefault: isDefault ?? false,
                userId,
                icon,
                cardColor,
            },
        });

        return NextResponse.json(notebook, { status: 201 });
    } catch (error) {
        console.error('Error creating notebook:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create notebook' },
            { status: 500 }
        );
    }
}
