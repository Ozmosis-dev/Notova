'use client';

import { useState, useEffect, useCallback } from 'react';

interface Tag {
    id: string;
    name: string;
    color: string | null;
    noteCount: number;
    createdAt: string;
}

interface UseTagsReturn {
    tags: Tag[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useTags(): UseTagsReturn {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTags = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/tags`);
            if (!response.ok) {
                throw new Error('Failed to fetch tags');
            }

            const data = await response.json();
            // Handle both array and { tags: [] } response formats
            const tagsArray = data.tags || data;
            if (Array.isArray(tagsArray)) {
                setTags(tagsArray);
            } else {
                setTags([]);
                if (data.error) {
                    throw new Error(data.error);
                }
            }
        } catch (err) {
            setTags([]);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return { tags, loading, error, refetch: fetchTags };
}

interface UseTagActionsReturn {
    createTag: (name: string, color?: string) => Promise<Tag | null>;
    deleteTag: (id: string) => Promise<boolean>;
    updateTagColor: (id: string, color: string | null) => Promise<boolean>;
    loading: boolean;
    error: Error | null;
}

export function useTagActions(): UseTagActionsReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createTag = useCallback(async (name: string, color?: string): Promise<Tag | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color }),
            });

            if (!response.ok) {
                throw new Error('Failed to create tag');
            }

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTag = useCallback(async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/tags/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete tag');
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTagColor = useCallback(async (id: string, color: string | null): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/tags/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ color }),
            });

            if (!response.ok) {
                throw new Error('Failed to update tag color');
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createTag, deleteTag, updateTagColor, loading, error };
}

interface AddTagToNoteReturn {
    addTagToNote: (noteId: string, tagName: string) => Promise<boolean>;
    removeTagFromNote: (noteId: string, tagId: string) => Promise<boolean>;
    loading: boolean;
}

export function useNoteTagActions(): AddTagToNoteReturn {
    const [loading, setLoading] = useState(false);

    const addTagToNote = useCallback(async (noteId: string, tagName: string): Promise<boolean> => {
        try {
            setLoading(true);

            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addTags: [tagName] }),
            });

            return response.ok;
        } catch {
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeTagFromNote = useCallback(async (noteId: string, tagId: string): Promise<boolean> => {
        try {
            setLoading(true);

            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ removeTags: [tagId] }),
            });

            return response.ok;
        } catch {
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return { addTagToNote, removeTagFromNote, loading };
}
