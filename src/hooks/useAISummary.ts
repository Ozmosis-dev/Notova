'use client';

import { useState, useCallback } from 'react';
import {
    NoteSummaryData,
    NotebookSummaryData,
    SearchInsightsData,
    SummaryType
} from '@/components/ai/AISummaryPanel';

type SummaryData = NoteSummaryData | NotebookSummaryData | SearchInsightsData;

interface UseAISummaryOptions {
    onSaveAsNote?: (content: string, title: string, notebookId?: string) => Promise<void>;
}

interface UseAISummaryReturn {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    summaryType: SummaryType;
    summaryTitle: string;
    data: SummaryData | null;
    summarizeNote: (noteId: string, noteTitle: string) => Promise<void>;
    summarizeNotebook: (notebookId: string, notebookName: string) => Promise<void>;
    generateSearchInsights: (query: string, noteIds: string[]) => Promise<void>;
    closePanel: () => void;
    retry: () => void;
    saveAsNote: (notebookId?: string) => Promise<void>;
}

export function useAISummary(options: UseAISummaryOptions = {}): UseAISummaryReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summaryType, setSummaryType] = useState<SummaryType>('note');
    const [summaryTitle, setSummaryTitle] = useState('');
    const [data, setData] = useState<SummaryData | null>(null);

    // Store last request for retry
    const [lastRequest, setLastRequest] = useState<{
        type: SummaryType;
        params: Record<string, unknown>;
    } | null>(null);

    const summarizeNote = useCallback(async (noteId: string, noteTitle: string) => {
        setIsOpen(true);
        setIsLoading(true);
        setError(null);
        setData(null);
        setSummaryType('note');
        setSummaryTitle(noteTitle);
        setLastRequest({ type: 'note', params: { noteId, noteTitle } });

        try {
            const response = await fetch('/api/ai/summarize-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate summary');
            }

            setData(result as NoteSummaryData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const summarizeNotebook = useCallback(async (notebookId: string, notebookName: string) => {
        setIsOpen(true);
        setIsLoading(true);
        setError(null);
        setData(null);
        setSummaryType('notebook');
        setSummaryTitle(notebookName);
        setLastRequest({ type: 'notebook', params: { notebookId, notebookName } });

        try {
            const response = await fetch('/api/ai/summarize-notebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notebookId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate summary');
            }

            setData(result as NotebookSummaryData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateSearchInsights = useCallback(async (query: string, noteIds: string[]) => {
        setIsOpen(true);
        setIsLoading(true);
        setError(null);
        setData(null);
        setSummaryType('search');
        setSummaryTitle(`Search: "${query}"`);
        setLastRequest({ type: 'search', params: { query, noteIds } });

        try {
            const response = await fetch('/api/ai/search-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, noteIds }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate insights');
            }

            setData(result as SearchInsightsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const closePanel = useCallback(() => {
        setIsOpen(false);
    }, []);

    const retry = useCallback(() => {
        if (!lastRequest) return;

        const { type, params } = lastRequest;

        switch (type) {
            case 'note':
                summarizeNote(params.noteId as string, params.noteTitle as string);
                break;
            case 'notebook':
                summarizeNotebook(params.notebookId as string, params.notebookName as string);
                break;
            case 'search':
                generateSearchInsights(params.query as string, params.noteIds as string[]);
                break;
        }
    }, [lastRequest, summarizeNote, summarizeNotebook, generateSearchInsights]);

    const saveAsNote = useCallback(async (notebookId?: string) => {
        if (!data || !options.onSaveAsNote) return;

        let content = `# AI Summary: ${summaryTitle}\n\n`;
        content += `${data.summary}\n\n`;

        if ('keyPoints' in data && data.keyPoints) {
            content += '## Key Points\n';
            data.keyPoints.forEach((point: string) => {
                content += `- ${point}\n`;
            });
            content += '\n';
        }

        if ('themes' in data && data.themes) {
            content += '## Themes\n';
            data.themes.forEach((theme: string) => {
                content += `- ${theme}\n`;
            });
            content += '\n';
        }

        if ('connections' in data && data.connections) {
            content += '## Connections\n';
            data.connections.forEach((conn: string) => {
                content += `- ${conn}\n`;
            });
            content += '\n';
        }

        if ('keyFindings' in data && data.keyFindings) {
            content += '## Key Findings\n';
            data.keyFindings.forEach((finding: string) => {
                content += `- ${finding}\n`;
            });
        }

        const noteTitle = summaryType === 'search'
            ? `Search Insights: ${summaryTitle.replace('Search: ', '').replace(/"/g, '')}`
            : `Summary: ${summaryTitle}`;

        await options.onSaveAsNote(content, noteTitle, notebookId);
        closePanel();
    }, [data, summaryTitle, summaryType, options, closePanel]);

    return {
        isOpen,
        isLoading,
        error,
        summaryType,
        summaryTitle,
        data,
        summarizeNote,
        summarizeNotebook,
        generateSearchInsights,
        closePanel,
        retry,
        saveAsNote,
    };
}

export default useAISummary;
