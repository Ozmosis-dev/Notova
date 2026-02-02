/**
 * AI Search Insights API Route
 * 
 * Generates AI-powered insights from search results.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';
import { generateSearchInsights, checkAIAvailability } from '@/lib/ai/gemini';
import { createHash } from 'crypto';

// Helper to create content hash
function hashContent(content: string): string {
    return createHash('md5').update(content).digest('hex');
}

// Cache duration: 24 hours for search insights
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

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
        const { query, noteIds } = body;

        if (!query || !noteIds || !Array.isArray(noteIds)) {
            return NextResponse.json(
                { error: 'Query and note IDs are required' },
                { status: 400 }
            );
        }

        if (noteIds.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 notes are required for insights' },
                { status: 400 }
            );
        }

        // Fetch the notes and verify ownership
        const notes = await prisma.note.findMany({
            where: {
                id: {
                    in: noteIds,
                },
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

        if (notes.length < 2) {
            return NextResponse.json(
                { error: 'Not enough valid notes found' },
                { status: 400 }
            );
        }

        // Prepare notes for insights
        const notesForInsights = notes.map((note: { title: string; contentPlaintext: string | null }) => ({
            title: note.title,
            content: note.contentPlaintext || '',
        }));

        // Create a unique target ID for caching based on query and note IDs
        const sortedNoteIds = [...noteIds].sort().join(',');
        const targetId = `search:${query}:${sortedNoteIds}`;

        // Create content hash
        const contentHash = hashContent(
            `${query}|${notesForInsights.map((n: { title: string; content: string }) => `${n.title}:${n.content}`).join('|')}`
        );

        // Check cache
        const cachedInsights = await prisma.aISummary.findFirst({
            where: {
                type: 'search',
                targetId: targetId,
            },
        });

        // Return cached result if valid
        if (cachedInsights &&
            cachedInsights.contentHash === contentHash &&
            cachedInsights.expiresAt > new Date()) {
            return NextResponse.json({
                summary: cachedInsights.summary,
                themes: cachedInsights.themes,
                connections: cachedInsights.connections,
                keyFindings: cachedInsights.keyFindings,
                noteCount: notes.length,
                query,
                cached: true,
            });
        }

        // Generate new insights
        const result = await generateSearchInsights(query, notesForInsights);

        // Cache the result (delete old first since targetId might be too long for unique constraint)
        await prisma.aISummary.deleteMany({
            where: {
                type: 'search',
                targetId: targetId,
            },
        });

        await prisma.aISummary.create({
            data: {
                type: 'search',
                targetId: targetId,
                contentHash,
                summary: result.insight, // Map insight to summary
                themes: result.themes,
                connections: result.connections,
                keyFindings: result.keyFindings,
                expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
            },
        });

        return NextResponse.json({
            summary: result.insight,
            themes: result.themes,
            connections: result.connections,
            keyFindings: result.keyFindings,
            noteCount: notes.length,
            query,
            cached: false,
        });

    } catch (error) {
        console.error('Error generating search insights:', error);

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
            { error: 'Failed to generate search insights. Please try again.' },
            { status: 500 }
        );
    }
}
