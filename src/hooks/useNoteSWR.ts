'use client';

import useSWR, { mutate } from 'swr';
import { useCallback, useRef } from 'react';

interface Tag {
    id: string;
    name: string;
}

interface Note {
    id: string;
    title: string;
    icon?: string | null;
    content: string;
    contentPlaintext?: string;
    notebookId?: string;
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
    isTrash: boolean;
}

// SWR fetcher
const fetcher = async (url: string): Promise<Note | null> => {
    const response = await fetch(url);
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Failed to fetch');
    }
    return response.json();
};

/**
 * SWR-powered hook for fetching and managing a single note.
 * 
 * Features:
 * - Automatic caching and revalidation
 * - Optimistic updates for better UX
 * - Debounced auto-save
 */
export function useNoteSWR(noteId: string | null) {
    const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const { data: note, error, isLoading, isValidating } = useSWR<Note | null>(
        noteId ? `/api/notes/${noteId}` : null,
        fetcher,
        {
            // Don't revalidate on focus (user is editing)
            revalidateOnFocus: false,
            // Keep previous data while loading
            keepPreviousData: false,
            // Retry on error
            errorRetryCount: 2,
            // Deduplicate within 2 seconds
            dedupingInterval: 2000,
        }
    );

    // Update note with optimistic update
    const updateNote = useCallback(async (data: { title?: string; content?: string }) => {
        if (!noteId) return;

        // Clear any pending auto-save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update note');
            }

            const updatedNote = await response.json();

            // Update the cache with the new data
            await mutate(`/api/notes/${noteId}`, updatedNote, false);

            // Also invalidate app-data to update the list
            await mutate(
                (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
                undefined,
                { revalidate: true }
            );

            return updatedNote;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    }, [noteId]);

    // Debounced update for auto-save (1 minute delay)
    const debouncedUpdate = useCallback((data: { title?: string; content?: string }) => {
        if (!noteId) return;

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout
        saveTimeoutRef.current = setTimeout(() => {
            updateNote(data);
        }, 60000);
    }, [noteId, updateNote]);

    // Cancel any pending save on unmount
    const cancelPendingSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
    }, []);

    // Delete note (move to trash or permanent)
    const deleteNote = useCallback(async (permanent: boolean = false) => {
        if (!noteId) return;

        cancelPendingSave();

        try {
            const params = new URLSearchParams();
            if (permanent) params.append('permanent', 'true');

            const response = await fetch(`/api/notes/${noteId}?${params.toString()}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            // Invalidate cache
            await mutate(`/api/notes/${noteId}`, null, false);
            await mutate(
                (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
                undefined,
                { revalidate: true }
            );
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    }, [noteId, cancelPendingSave]);

    // Restore note from trash
    const restoreNote = useCallback(async () => {
        if (!noteId) return;

        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isTrash: false }),
            });

            if (!response.ok) {
                throw new Error('Failed to restore note');
            }

            const updatedNote = await response.json();

            // Update cache
            await mutate(`/api/notes/${noteId}`, updatedNote, false);
            await mutate(
                (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
                undefined,
                { revalidate: true }
            );
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    }, [noteId]);

    // Update note tags optimistically (for immediate UI feedback)
    const updateNoteTags = useCallback(async (tags: Tag[]) => {
        if (!noteId || !note) return;

        // Optimistically update the local cache
        await mutate(
            `/api/notes/${noteId}`,
            { ...note, tags, updatedAt: new Date().toISOString() },
            false // Don't revalidate - the API call was already made by TagSelector
        );

        // Also invalidate app-data to update the notes list/sidebar
        await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
            undefined,
            { revalidate: true }
        );
    }, [noteId, note]);

    // Refetch the current note
    const refetch = useCallback(async () => {
        if (!noteId) return;
        await mutate(`/api/notes/${noteId}`);
    }, [noteId]);

    return {
        note: note ?? null,
        loading: isLoading,
        validating: isValidating,
        error: error ?? null,
        updateNote,
        updateNoteTags,
        debouncedUpdate,
        deleteNote,
        restoreNote,
        refetch,
        cancelPendingSave,
    };
}

/**
 * Hook for creating new notes
 */
export function useCreateNoteSWR() {
    const createNote = useCallback(async (data: {
        title?: string;
        content?: string;
        notebookId: string;
        tags?: string[];
    }): Promise<Note | null> => {
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title || 'Untitled',
                    content: data.content || '',
                    notebookId: data.notebookId,
                    tags: data.tags,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            const newNote = await response.json();

            // Invalidate app-data to show the new note in the list
            await mutate(
                (key) => typeof key === 'string' && key.startsWith('/api/app-data'),
                undefined,
                { revalidate: true }
            );

            return newNote;
        } catch (err) {
            console.error('Error creating note:', err);
            return null;
        }
    }, []);

    return { createNote };
}
