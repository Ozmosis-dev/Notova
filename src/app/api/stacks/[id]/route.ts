import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';
import { z } from 'zod';

const updateStackSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    icon: z.string().optional().nullable(),
});

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validation = updateStackSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, icon } = validation.data;

        // Verify ownership and existence
        const existingStack = await prisma.stack.findUnique({
            where: { id },
        });

        if (!existingStack || existingStack.userId !== userId) {
            return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
        }

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (icon !== undefined) data.icon = icon;

        const updatedStack = await prisma.stack.update({
            where: { id },
            data,
        });

        return NextResponse.json(updatedStack);
    } catch (error) {
        console.error('Error updating stack:', error);
        return NextResponse.json({ error: 'Failed to update stack' }, { status: 500 });
    }
}


export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        const userId = await getAuthUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership and existence
        const existingStack = await prisma.stack.findUnique({
            where: { id },
            include: { notebooks: true }, // Check for notebooks if we wanted to block, but we will just unstack them
        });

        if (!existingStack || existingStack.userId !== userId) {
            return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
        }

        // Deleting the stack will automatically set stackId to null on associated notebooks
        // if we configured correct onDelete behavior, OR we can manually do it to be safe.
        // In schema we didn't specify onDelete for the relation on Notebook side, so it's optional.
        // Prisma default for optional relations is SetNull usually, but let's be explicit if needed.
        // Actually, since Notebook.stackId is optional and we didn't set onDelete: Cascade on the Notebook definition (we can't on the child side),
        // we should check what happens.
        // However, standard behavior for optional relation when parent is deleted is typically SetNull or Restrict.
        // Let's manually disconnect notebooks first to be 100% sure they are not deleted.

        await prisma.notebook.updateMany({
            where: { stackId: id },
            data: { stackId: null },
        });

        await prisma.stack.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting stack:', error);
        return NextResponse.json({ error: 'Failed to delete stack' }, { status: 500 });
    }
}
