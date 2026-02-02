/**
 * AI Notebook Summarization API Route
 * 
 * Generates an AI-powered summary of an entire notebook's notes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';
import { summarizeNotebook, checkAIAvailability } from '@/lib/ai/gemini';
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
        if (!aiAvailable) {
            return NextResponse.json(
                { error: 'AI service is not configured. Please set up your GOOGLE_AI_API_KEY.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { notebookId } = body;

        if (!notebookId) {
            return NextResponse.json(
                { error: 'Notebook ID is required' },
                { status: 400 }
            );
        }

        // Fetch the notebook and verify ownership
        const notebook = await prisma.notebook.findFirst({
            where: {
                id: notebookId,
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                notes: {
                    where: {
                        isTrash: false,
                    },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        contentPlaintext: true,
                    },
                    orderBy: {
                        updatedAt: 'desc',
                    },
                    take: 50, // Limit to 50 most recent notes
                },
            },
        });

        if (!notebook) {
            return NextResponse.json(
                { error: 'Notebook not found' },
                { status: 404 }
            );
        }

        if (notebook.notes.length === 0) {
            return NextResponse.json(
                { error: 'Notebook has no notes to summarize' },
                { status: 400 }
            );
        }

        // Prepare notes for summarization
        const notesForSummary = notebook.notes.map((note: { title: string; contentPlaintext: string | null }) => ({
            title: note.title,
            content: note.contentPlaintext || '',
        }));

        // Create content hash from all notes
        const contentHash = hashContent(
            notesForSummary.map((n: { title: string; content: string }) => `${n.title}:${n.content}`).join('|')
        );

        // Check cache
        const cachedSummary = await prisma.aISummary.findUnique({
            where: {
                type_targetId: {
                    type: 'notebook',
                    targetId: notebookId,
                },
            },
        });

        // Return cached result if valid
        if (cachedSummary &&
            cachedSummary.contentHash === contentHash &&
            cachedSummary.expiresAt > new Date()) {
            return NextResponse.json({
                summary: cachedSummary.summary,
                themes: cachedSummary.themes,
                keyFindings: cachedSummary.keyFindings,
                noteCount: notebook.notes.length,
                cached: true,
            });
        }

        // Generate new summary
        const result = await summarizeNotebook(notebook.name, notesForSummary);

        // Cache the result
        await prisma.aISummary.upsert({
            where: {
                type_targetId: {
                    type: 'notebook',
                    targetId: notebookId,
                },
            },
            create: {
                type: 'notebook',
                targetId: notebookId,
                contentHash,
                summary: result.summary,
                themes: result.themes,
                keyFindings: result.keyInsights, // Map keyInsights to keyFindings
                expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
            },
            update: {
                contentHash,
                summary: result.summary,
                themes: result.themes,
                keyFindings: result.keyInsights, // Map keyInsights to keyFindings
                expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
            },
        });

        return NextResponse.json({
            summary: result.summary,
            themes: result.themes,
            keyFindings: result.keyInsights,
            noteCount: notebook.notes.length,
            cached: false,
        });

    } catch (error) {
        console.error('Error summarizing notebook:', error);

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
            { error: 'Failed to generate notebook summary. Please try again.' },
            { status: 500 }
        );
    }
}
