import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';
import { z } from 'zod';

const createStackSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    icon: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = createStackSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { name, icon } = validation.data;

        // Create the stack
        const stack = await prisma.stack.create({
            data: {
                name,
                icon: icon || null,
                userId,
            },
        });

        return NextResponse.json(stack, { status: 201 });
    } catch (error) {
        console.error('Error creating stack:', error);
        return NextResponse.json(
            { error: 'Failed to create stack' },
            { status: 500 }
        );
    }
}
