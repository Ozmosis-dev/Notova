/**
 * AI Smart Tags API Route
 * 
 * Suggests relevant tags for a collection of notes based on their content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';
import { suggestSmartTags, checkAIAvailability } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const userId = await getAuthUserId();

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if AI is available
        const aiAvailable = await checkAIAvailability();
        if (!aiAvailable) {
            return NextResponse.json(
                { error: 'AI service is not configured. Please set up your GOOGLE_AI_API_KEY.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { noteIds } = body;

        if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
            return NextResponse.json(
                { error: 'Note IDs are required' },
                { status: 400 }
            );
        }

        // Fetch notes and verify ownership through notebook relation
        const notes = await prisma.note.findMany({
            where: {
                id: { in: noteIds },
                notebook: { userId: userId },
                isTrash: false,
            },
            select: {
                id: true,
                title: true,
                contentPlaintext: true,
            },
        });

        if (notes.length === 0) {
            return NextResponse.json(
                { error: 'No valid notes found' },
                { status: 404 }
            );
        }

        // Fetch existing tags for the user
        const existingTags = await prisma.tag.findMany({
            where: { userId: userId },
            select: { name: true },
        });
        const existingTagNames = existingTags.map(t => t.name);

        // Prepare notes for AI analysis
        const notesForAnalysis = notes.map((note: { title: string; contentPlaintext: string | null }) => ({
            title: note.title,
            content: note.contentPlaintext || '',
        }));

        // Generate smart tag suggestions
        const result = await suggestSmartTags(notesForAnalysis, existingTagNames);

        return NextResponse.json({
            suggestedTags: result.suggestedTags,
            noteCount: notes.length,
        });

    } catch (error) {
        console.error('Error suggesting smart tags:', error);

        // Handle specific errors
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();

            if (errorMessage.includes('api key') || errorMessage.includes('api_key')) {
                return NextResponse.json(
                    { error: 'AI service configuration error. Please check your API key.' },
                    { status: 503 }
                );
            }

            if (errorMessage.includes('429') ||
                errorMessage.includes('rate limit') ||
                errorMessage.includes('quota') ||
                errorMessage.includes('too many requests')) {
                return NextResponse.json(
                    { error: 'AI service quota exceeded. Please try again later.' },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to suggest tags. Please try again.' },
            { status: 500 }
        );
    }
}
