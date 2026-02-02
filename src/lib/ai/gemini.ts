/**
 * Gemini AI Client for Notova
 * 
 * Provides AI-powered summarization capabilities using Google's Gemini 2.0 Flash model.
 * This wrapper includes error handling, rate limiting awareness, and customized prompts.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Singleton pattern for the Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    if (!genAI) {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_AI_API_KEY environment variable is not set');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

// Safety settings - allow most content for personal notes
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];

// Generation config for fast, focused responses
const generationConfig = {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1024,
};

/**
 * System prompts for different AI tasks
 */
export const PROMPTS = {
    NOTE_SUMMARY: `You are an intelligent note assistant for Notova, a personal note-taking app.
Summarize the following note concisely while preserving key information.
Respond in a friendly, helpful tone. Keep the summary under 150 words.

Your response MUST be valid JSON in this exact format:
{
  "summary": "A concise summary of the note content",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}

Extract 3-5 key points as an array. Do not include any text outside the JSON.`,

    NOTEBOOK_SUMMARY: `You are an intelligent note assistant for Notova.
Analyze the following collection of notes from a notebook and provide insights.

Your response MUST be valid JSON in this exact format:
{
  "summary": "A comprehensive summary of all notes (200 words max)",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "keyInsights": ["Insight 1", "Insight 2"]
}

Identify common themes and key insights the user should know. Do not include any text outside the JSON.`,

    SEARCH_INSIGHTS: (query: string) => `You are an intelligent note assistant for Notova.
The user searched for "${query}" and these notes matched their search.

Analyze ALL the notes below and create a connected narrative that synthesizes the information.

Your response MUST be valid JSON in this exact format:
{
  "insight": "A connected narrative that synthesizes information across all notes about '${query}' (250 words max)",
  "themes": ["Common theme 1", "Common theme 2"],
  "connections": ["How note A relates to note B", "Pattern across notes"],
  "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3"]
}

Be insightful and help the user understand their knowledge as a whole. Do not include any text outside the JSON.`,
};

/**
 * Summarize a single note
 */
export async function summarizeNote(
    title: string,
    content: string
): Promise<{ summary: string; keyPoints: string[] }> {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: 'models/gemini-2.0-flash',
        safetySettings,
        generationConfig,
    });

    const prompt = `${PROMPTS.NOTE_SUMMARY}

Note Title: ${title}

Note Content:
${content}`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            summary: parsed.summary || 'Unable to generate summary',
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        };
    } catch (error) {
        console.error('Error summarizing note:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to summarize note');
    }
}

/**
 * Summarize all notes in a notebook
 */
export async function summarizeNotebook(
    notebookName: string,
    notes: Array<{ title: string; content: string }>
): Promise<{ summary: string; themes: string[]; keyInsights: string[] }> {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: 'models/gemini-2.0-flash',
        safetySettings,
        generationConfig: { ...generationConfig, maxOutputTokens: 2048 },
    });

    // Prepare notes content (truncate if too long)
    const notesContent = notes
        .slice(0, 20) // Limit to 20 notes to avoid token limits
        .map((note, i) => `--- Note ${i + 1}: ${note.title} ---\n${note.content.substring(0, 1000)}`)
        .join('\n\n');

    const prompt = `${PROMPTS.NOTEBOOK_SUMMARY}

Notebook: ${notebookName}
Number of notes: ${notes.length}

Notes Content:
${notesContent}`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            summary: parsed.summary || 'Unable to generate summary',
            themes: Array.isArray(parsed.themes) ? parsed.themes : [],
            keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        };
    } catch (error) {
        console.error('Error summarizing notebook:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to summarize notebook');
    }
}

/**
 * Generate insights from search results
 */
export async function generateSearchInsights(
    query: string,
    notes: Array<{ title: string; content: string }>
): Promise<{
    insight: string;
    themes: string[];
    connections: string[];
    keyFindings: string[];
}> {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: 'models/gemini-2.0-flash',
        safetySettings,
        generationConfig: { ...generationConfig, maxOutputTokens: 2048 },
    });

    // Prepare notes content (truncate if too long)
    const notesContent = notes
        .slice(0, 15) // Limit to 15 notes to avoid token limits
        .map((note, i) => `--- Note ${i + 1}: ${note.title} ---\n${note.content.substring(0, 800)}`)
        .join('\n\n');

    const prompt = `${PROMPTS.SEARCH_INSIGHTS(query)}

Search Query: "${query}"
Number of matching notes: ${notes.length}

Matching Notes:
${notesContent}`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            insight: parsed.insight || 'Unable to generate insights',
            themes: Array.isArray(parsed.themes) ? parsed.themes : [],
            connections: Array.isArray(parsed.connections) ? parsed.connections : [],
            keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
        };
    } catch (error) {
        console.error('Error generating search insights:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to generate insights');
    }
}

/**
 * Check if the AI service is available
 */
export async function checkAIAvailability(): Promise<boolean> {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        return !!apiKey && apiKey.length > 0;
    } catch {
        return false;
    }
}
