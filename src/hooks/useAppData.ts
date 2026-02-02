'use client';

import useSWR, { mutate } from 'swr';
import { useCallback, useMemo } from 'react';

// Types
interface Notebook {
    id: string;
    name: string;
    icon?: string | null;
    cardColor?: string | null;
    isDefault: boolean;
    noteCount: number;
    createdAt: string;
    updatedAt: string;
}

interface Tag {
    id: string;
    name: string;
    noteCount: number;
    createdAt: string;
}

interface NotePreview {
    id: string;
    title: string;
    icon?: string | null;
    cardColor?: string | null;
    preview: string;
    updatedAt: string;
    createdAt: string;
    isTrash: boolean;
    isFavorite?: boolean;
    tags: Array<{ id: string; name: string }>;
    notebookId?: string;
    notebook?: { id: string; name: string };
}

interface AppDataOptions {
    notebookId?: string | null;
    tagId?: string | null;
    isTrash?: boolean;
}

interface AppData {
    notebooks: Notebook[];
    tags: Tag[];
    notes: NotePreview[];
}

// SWR fetcher with error handling
const fetcher = async (url: string): Promise<AppData> => {
    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Failed to fetch');
    }
    return response.json();
};

// Build cache key from options
function buildCacheKey(options: AppDataOptions): string {
    const params = new URLSearchParams();
    if (options.notebookId) params.append('notebookId', options.notebookId);
    if (options.tagId) params.append('tagId', options.tagId);
    if (options.isTrash) params.append('isTrash', 'true');

    const queryString = params.toString();
    return `/api/app-data${queryString ? `?${queryString}` : ''}`;
}

/**
 * Combined hook for fetching all app data with SWR caching.
 * 
 * Benefits:
 * - Single request instead of 3 separate requests
 * - Automatic request deduplication
 * - Stale-while-revalidate caching
 * - Automatic retry on error
 * - Tab focus revalidation
 */
export function useAppData(options: AppDataOptions = {}) {
    const cacheKey = buildCacheKey(options);

    const { data, error, isLoading, isValidating } = useSWR<AppData>(
        cacheKey,
        fetcher,
        {
            // Deduplicate requests within 5 seconds
            dedupingInterval: 5000,
            // Keep data fresh for 30 seconds
            revalidateOnFocus: false,
            // Don't revalidate on reconnect (user can manually refresh)
            revalidateOnReconnect: false,
            // Cache for 1 minute
            refreshInterval: 0,
            // Retry on error
            errorRetryCount: 3,
            // Keep previous data while loading new data
            keepPreviousData: true,
        }
    );

    // Memoized refetch function that invalidates all app-data keys
    const refetch = useCallback(async () => {
        // Invalidate all app-data cache entries
        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            undefined,
            { revalidate: true }
        );
    }, []);

    // Memoized values to prevent unnecessary re-renders
    const notebooks = useMemo(() => data?.notebooks ?? [], [data?.notebooks]);
    const tags = useMemo(() => data?.tags ?? [], [data?.tags]);
    const notes = useMemo(() => data?.notes ?? [], [data?.notes]);

    return {
        notebooks,
        tags,
        notes,
        loading: isLoading,
        validating: isValidating,
        error: error || null,
        refetch,
    };
}

/**
 * Individual data mutations with optimistic update support
 */
export function useAppDataMutations() {
    // Refetch all data
    const refetchAll = useCallback(async () => {
        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            undefined,
            { revalidate: true }
        );
    }, []);

    /**
     * Optimistically update a note property (favorites, icon, color, etc.)
     * Updates UI immediately while API call happens in background
     */
    const optimisticUpdateNote = useCallback(async (
        noteId: string,
        updates: Partial<NotePreview>,
        apiCall: () => Promise<unknown>
    ) => {
        // Update all app-data cache keys optimistically
        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                // Perform the API call
                await apiCall();

                // Return updated data (will be used if API succeeds)
                return {
                    ...currentData,
                    notes: currentData.notes.map(note =>
                        note.id === noteId
                            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                            : note
                    )
                };
            },
            {
                // Optimistic data - shown immediately before API completes
                optimisticData: (currentData: AppData | undefined) => {
                    if (!currentData) return { notebooks: [], tags: [], notes: [] };
                    return {
                        ...currentData,
                        notes: currentData.notes.map(note =>
                            note.id === noteId
                                ? { ...note, ...updates, updatedAt: new Date().toISOString() }
                                : note
                        )
                    };
                },
                rollbackOnError: true,
                revalidate: false, // Don't revalidate on success, only on error
            }
        );
    }, []);

    /**
     * Optimistically add a new note to the list
     */
    const optimisticAddNote = useCallback(async (
        tempNote: NotePreview,
        apiCall: () => Promise<NotePreview | null>
    ): Promise<NotePreview | null> => {
        let createdNote: NotePreview | null = null;

        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                // Perform the API call
                createdNote = await apiCall();

                if (!createdNote) {
                    throw new Error('Failed to create note');
                }

                // Return with the real note (replacing temp)
                return {
                    ...currentData,
                    notes: [createdNote, ...currentData.notes.filter(n => n.id !== tempNote.id)],
                    notebooks: currentData.notebooks.map(nb =>
                        nb.id === createdNote!.notebookId
                            ? { ...nb, noteCount: nb.noteCount + 1 }
                            : nb
                    )
                };
            },
            {
                optimisticData: (currentData: AppData | undefined) => {
                    if (!currentData) return { notebooks: [], tags: [], notes: [tempNote] };
                    return {
                        ...currentData,
                        notes: [tempNote, ...currentData.notes],
                        notebooks: currentData.notebooks.map(nb =>
                            nb.id === tempNote.notebookId
                                ? { ...nb, noteCount: nb.noteCount + 1 }
                                : nb
                        )
                    };
                },
                rollbackOnError: true,
                revalidate: false,
            }
        );

        return createdNote;
    }, []);

    /**
     * Optimistically add a new notebook
     */
    const optimisticAddNotebook = useCallback(async (
        tempNotebook: Notebook,
        apiCall: () => Promise<Notebook | null>
    ): Promise<Notebook | null> => {
        let createdNotebook: Notebook | null = null;

        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                createdNotebook = await apiCall();

                if (!createdNotebook) {
                    throw new Error('Failed to create notebook');
                }

                return {
                    ...currentData,
                    notebooks: [...currentData.notebooks, createdNotebook]
                };
            },
            {
                optimisticData: (currentData: AppData | undefined) => {
                    if (!currentData) return { notebooks: [tempNotebook], tags: [], notes: [] };
                    return {
                        ...currentData,
                        notebooks: [...currentData.notebooks, tempNotebook]
                    };
                },
                rollbackOnError: true,
                revalidate: false,
            }
        );

        return createdNotebook;
    }, []);

    /**
     * Optimistically update a notebook property
     */
    const optimisticUpdateNotebook = useCallback(async (
        notebookId: string,
        updates: Partial<Notebook>,
        apiCall: () => Promise<unknown>
    ) => {
        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                await apiCall();

                return {
                    ...currentData,
                    notebooks: currentData.notebooks.map(nb =>
                        nb.id === notebookId
                            ? { ...nb, ...updates, updatedAt: new Date().toISOString() }
                            : nb
                    )
                };
            },
            {
                optimisticData: (currentData: AppData | undefined) => {
                    if (!currentData) return { notebooks: [], tags: [], notes: [] };
                    return {
                        ...currentData,
                        notebooks: currentData.notebooks.map(nb =>
                            nb.id === notebookId
                                ? { ...nb, ...updates, updatedAt: new Date().toISOString() }
                                : nb
                        )
                    };
                },
                rollbackOnError: true,
                revalidate: false,
            }
        );
    }, []);

    return {
        refetchAll,
        optimisticUpdateNote,
        optimisticAddNote,
        optimisticAddNotebook,
        optimisticUpdateNotebook,
    };
}

