/**
 * AI Note Summarization API Route
 * 
 * Generates an AI-powered summary of a single note.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';
import { summarizeNote, checkAIAvailability } from '@/lib/ai/gemini';
import { createHash } from 'crypto';

// Helper to create content hash
function hashContent(content: string): string {
    return createHash('md5').update(content).digest('hex');
}

// Cache duration: 30 days
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

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
        console.log('AI availability check:', { aiAvailable, apiKeySet: !!process.env.GOOGLE_AI_API_KEY, apiKeyLength: process.env.GOOGLE_AI_API_KEY?.length });
        if (!aiAvailable) {
            return NextResponse.json(
                { error: 'AI service is not configured. Please set up your GOOGLE_AI_API_KEY.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { noteId } = body;

        if (!noteId) {
            return NextResponse.json(
                { error: 'Note ID is required' },
                { status: 400 }
            );
        }

        // Fetch the note and verify ownership
        const note = await prisma.note.findFirst({
            where: {
                id: noteId,
                notebook: {
                    userId: userId,
                },
            },
            select: {
                id: true,
                title: true,
                content: true,
                contentPlaintext: true,
            },
        });

        if (!note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        // Check if note has enough content
        const textContent = note.contentPlaintext || '';
        if (textContent.length < 50) {
            return NextResponse.json(
                { error: 'Note content is too short to summarize. Add more content first.' },
                { status: 400 }
            );
        }

        // Calculate content hash for caching
        const contentHash = hashContent(textContent);

        // Check cache
        const cachedSummary = await prisma.aISummary.findUnique({
            where: {
                type_targetId: {
                    type: 'note',
                    targetId: noteId,
                },
            },
        });

        // Return cached result if valid
        if (cachedSummary &&
            cachedSummary.contentHash === contentHash &&
            cachedSummary.expiresAt > new Date()) {
            return NextResponse.json({
                summary: cachedSummary.summary,
                keyPoints: cachedSummary.keyPoints,
                cached: true,
            });
        }

        // Generate new summary
        const result = await summarizeNote(note.title, textContent);

        // Cache the result
        await prisma.aISummary.upsert({
            where: {
                type_targetId: {
                    type: 'note',
                    targetId: noteId,
                },
            },
            create: {
                type: 'note',
                targetId: noteId,
                contentHash,
                summary: result.summary,
                keyPoints: result.keyPoints,
                expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
            },
            update: {
                contentHash,
                summary: result.summary,
                keyPoints: result.keyPoints,
                expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
            },
        });

        return NextResponse.json({
            summary: result.summary,
            keyPoints: result.keyPoints,
            cached: false,
        });

    } catch (error) {
        console.error('Error summarizing note:', error);

        // Handle specific errors
        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase();

            if (errorMessage.includes('api key') || errorMessage.includes('api_key')) {
                return NextResponse.json(
                    { error: 'AI service configuration error. Please check your API key.' },
                    { status: 503 }
                );
            }

            // Check for rate limit / quota errors (Gemini returns 429 and quota exceeded messages)
            if (errorMessage.includes('429') ||
                errorMessage.includes('rate limit') ||
                errorMessage.includes('quota') ||
                errorMessage.includes('too many requests')) {
                return NextResponse.json(
                    { error: 'AI service quota exceeded. The free tier limit has been reached. Please upgrade your Google AI API plan or try again later.' },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to generate summary. Please try again.' },
            { status: 500 }
        );
    }
}
