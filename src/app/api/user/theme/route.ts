import { NextRequest, NextResponse } from 'next/server';
import { createClient, ensureDbUser } from '@/lib/supabase/server';
import { prisma } from '@/lib/db/prisma';
import { isValidTheme, DEFAULT_THEME } from '@/lib/themes';

// GET /api/user/theme - Get current user's theme preference
// Uses getSession() for faster auth (reads from cookies, no network call)
export async function GET() {
    try {
        const supabase = await createClient();
        // Use getSession() instead of getUser() - it reads from cookies locally
        // which is much faster than making a network call to Supabase auth servers
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Ensure user exists in database
        await ensureDbUser();

        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { theme: true }
        });

        return NextResponse.json({
            theme: dbUser?.theme || DEFAULT_THEME
        });
    } catch (error) {
        console.error('Error fetching user theme:', error);
        return NextResponse.json(
            { error: 'Failed to fetch theme' },
            { status: 500 }
        );
    }
}

// PATCH /api/user/theme - Update user's theme preference
// Uses getSession() for faster auth (reads from cookies, no network call)
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        // Use getSession() instead of getUser() for faster authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { theme } = body;

        // Validate theme value
        if (!theme || typeof theme !== 'string') {
            return NextResponse.json(
                { error: 'Theme is required' },
                { status: 400 }
            );
        }

        if (!isValidTheme(theme)) {
            return NextResponse.json(
                { error: 'Invalid theme value. Must be one of: light, dark, warm, cool, earth, spring, midnight, autumn' },
                { status: 400 }
            );
        }

        // Ensure user exists in database before updating
        await ensureDbUser();

        // Update user's theme in database
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { theme },
            select: { theme: true }
        });

        return NextResponse.json({
            theme: updatedUser.theme,
            message: 'Theme updated successfully'
        });
    } catch (error) {
        console.error('Error updating user theme:', error);
        return NextResponse.json(
            { error: 'Failed to update theme' },
            { status: 500 }
        );
    }
}
