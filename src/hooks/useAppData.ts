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
    isPinned?: boolean;
    noteCount: number;
    createdAt: string;
    updatedAt: string;
    stackId?: string | null;
}

interface Stack {
    id: string;
    name: string;
    icon?: string | null;
    userId: string;
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

export interface AppDataOptions {
    notebookId?: string | null;
    tagId?: string | null;
    isTrash?: boolean;
}

export interface AppData {
    notebooks: Notebook[];
    stacks: Stack[];
    tags: Tag[];
    notes: NotePreview[];
    trashCount: number;
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
    const stacks = useMemo(() => data?.stacks ?? [], [data?.stacks]);
    const tags = useMemo(() => data?.tags ?? [], [data?.tags]);
    const notes = useMemo(() => data?.notes ?? [], [data?.notes]);

    const trashCount = useMemo(() => data?.trashCount ?? 0, [data?.trashCount]);

    return {
        notebooks,
        stacks,
        tags,
        notes,
        trashCount,
        loading: isLoading,
        validating: isValidating,
        error: error || null,
        refetch,
    };
}

/**
 * Individual data mutations with optimistic update support
 */
export function useAppDataMutations(fallbackData?: AppData) {
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
                    if (!currentData) return { notebooks: [], stacks: [], tags: [], notes: [], trashCount: 0 };
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
                    if (!currentData) return { notebooks: [], stacks: [], tags: [], notes: [tempNote], trashCount: 0 };
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

        // Capture current data state for fallback
        // fallbackData is passed from the hook argument

        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                createdNotebook = await apiCall();

                if (!createdNotebook) {
                    throw new Error('Failed to create notebook');
                }

                // Return with the real notebook (replacing temp)
                return {
                    ...currentData,
                    notebooks: [createdNotebook, ...currentData.notebooks.filter(nb => nb.id !== tempNotebook.id)]
                };
            },
            {
                optimisticData: (currentData: AppData | undefined) => {
                    // Use current data or fallback to existing data structure with new notebook
                    // This is critical when creating a notebook and immediately switching to it (new SWR key)
                    const baseData = currentData || fallbackData || {
                        notebooks: [],
                        stacks: [],
                        tags: [],
                        notes: [],
                        trashCount: 0
                    };

                    return {
                        ...baseData,
                        notebooks: [tempNotebook, ...baseData.notebooks]
                    };
                },
                rollbackOnError: true,
                revalidate: true,
            }
        );

        return createdNotebook;
    }, [fallbackData]);

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
                    if (!currentData) return { notebooks: [], stacks: [], tags: [], notes: [], trashCount: 0 };
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

    /**
     * Optimistically add a new stack
     */
    const optimisticAddStack = useCallback(async (
        tempStack: Stack,
        apiCall: () => Promise<Stack | null>
    ): Promise<Stack | null> => {
        let createdStack: Stack | null = null;

        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                createdStack = await apiCall();

                if (!createdStack) {
                    throw new Error('Failed to create stack');
                }

                // Return with the real stack (replacing temp)
                return {
                    ...currentData,
                    stacks: [createdStack, ...currentData.stacks.filter(s => s.id !== tempStack.id)]
                };
            },
            {
                optimisticData: (currentData: AppData | undefined) => {
                    if (!currentData) return { notebooks: [], stacks: [tempStack], tags: [], notes: [], trashCount: 0 };
                    return {
                        ...currentData,
                        stacks: [tempStack, ...currentData.stacks]
                    };
                },
                rollbackOnError: true,
                revalidate: true,
            }
        );

        return createdStack;
    }, []);

    /**
     * Optimistically update a stack
     */
    const optimisticUpdateStack = useCallback(async (
        stackId: string,
        updates: Partial<Stack>,
        apiCall: () => Promise<unknown>
    ) => {
        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                await apiCall();

                return {
                    ...currentData,
                    stacks: currentData.stacks.map(s =>
                        s.id === stackId
                            ? { ...s, ...updates, updatedAt: new Date().toISOString() }
                            : s
                    )
                };
            },
            {
                optimisticData: (currentData: AppData | undefined) => {
                    if (!currentData) return { notebooks: [], stacks: [], tags: [], notes: [], trashCount: 0 };
                    return {
                        ...currentData,
                        stacks: currentData.stacks.map(s =>
                            s.id === stackId
                                ? { ...s, ...updates, updatedAt: new Date().toISOString() }
                                : s
                        )
                    };
                },
                rollbackOnError: true,
                revalidate: false,
            }
        );
    }, []);

    /**
     * Optimistically delete a stack
     * Note: This usually involves updating notebooks to remove stackId as well,
     * but strictly speaking for the stack list itself, we just remove the stack.
     * The backend handles unstacking notebooks.
     * Optimistically, we might want to unstack notebooks locally too?
     * For now, just removing the stack from the list.
     */
    const optimisticDeleteStack = useCallback(async (
        stackId: string,
        apiCall: () => Promise<unknown>
    ) => {
        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            async (currentData: AppData | undefined) => {
                if (!currentData) return currentData;

                await apiCall();

                // On success, notebooks should be unstacked.
                // We'll rely on revalidation or manual update of notebooks if needed.
                // But typically delete returns success.
                // Ideally we return updated notebooks too.
                // For simple optimistic UI, we remove stack.
                // We should also update notebooks locally to set stackId=null for those in this stack.
                return {
                    ...currentData,
                    stacks: currentData.stacks.filter(s => s.id !== stackId),
                    notebooks: currentData.notebooks.map(nb =>
                        nb.stackId === stackId ? { ...nb, stackId: null } : nb
                    )
                };
            },
            {
                optimisticData: (currentData: AppData | undefined) => {
                    if (!currentData) return { notebooks: [], stacks: [], tags: [], notes: [], trashCount: 0 };
                    return {
                        ...currentData,
                        stacks: currentData.stacks.filter(s => s.id !== stackId),
                        notebooks: currentData.notebooks.map(nb =>
                            nb.stackId === stackId ? { ...nb, stackId: null } : nb
                        )
                    };
                },
                rollbackOnError: true,
                revalidate: true,
            }
        );
    }, []);

    return {
        refetchAll,
        optimisticUpdateNote,
        optimisticAddNote,
        optimisticAddNotebook,
        optimisticUpdateNotebook,
        optimisticAddStack,
        optimisticUpdateStack,
        optimisticDeleteStack,
    };
}

