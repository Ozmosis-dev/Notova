'use client';

import { useState, useEffect, useCallback } from 'react';

interface Tag {
    id: string;
    name: string;
}

interface NotePreview {
    id: string;
    title: string;
    preview: string;
    updatedAt: string;
    createdAt: string;
    isTrash: boolean;
    tags: Tag[];
    notebookId?: string;
}

interface Note extends NotePreview {
    content: string;
    contentPlaintext?: string;
}

interface UseNotesOptions {
    notebookId?: string | null;
    tagId?: string | null;
    isTrash?: boolean;
    search?: string;
}

interface UseNotesReturn {
    notes: NotePreview[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useNotes(options: UseNotesOptions = {}): UseNotesReturn {
    const { notebookId, tagId, isTrash = false, search } = options;

    const [notes, setNotes] = useState<NotePreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (notebookId) params.append('notebookId', notebookId);
            if (tagId) params.append('tagId', tagId);
            if (isTrash) params.append('isTrash', 'true');
            if (search) params.append('search', search);

            const response = await fetch(`/api/notes?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            const data = await response.json();
            // Handle paginated response { notes: [...], pagination: {...} }
            const notesArray = data.notes || data;

            if (Array.isArray(notesArray)) {
                setNotes(notesArray.map((note: Note) => ({
                    id: note.id,
                    title: note.title,
                    preview: note.preview || note.contentPlaintext?.substring(0, 200) || '',
                    updatedAt: note.updatedAt,
                    createdAt: note.createdAt,
                    isTrash: note.isTrash,
                    tags: note.tags,
                    notebookId: note.notebookId,
                })));
            } else {
                // API returned an error object or unexpected format
                setNotes([]);
                if (data.error) {
                    throw new Error(data.error);
                }
            }
        } catch (err) {
            setNotes([]);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [notebookId, tagId, isTrash, search]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    return { notes, loading, error, refetch: fetchNotes };
}

interface UseNoteReturn {
    note: Note | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    updateNote: (data: { title?: string; content?: string }) => Promise<void>;
    deleteNote: (permanent?: boolean) => Promise<void>;
    restoreNote: () => Promise<void>;
}

export function useNote(noteId: string | null): UseNoteReturn {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchNote = useCallback(async () => {
        if (!noteId) {
            setNote(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/notes/${noteId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setNote(null);
                    return;
                }
                throw new Error('Failed to fetch note');
            }

            const data = await response.json();
            setNote(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [noteId]);

    useEffect(() => {
        fetchNote();
    }, [fetchNote]);

    const updateNote = useCallback(async (data: { title?: string; content?: string }) => {
        if (!noteId) return;

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
            setNote(updatedNote);
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    }, [noteId]);

    const deleteNote = useCallback(async (permanent: boolean = false) => {
        if (!noteId) return;

        try {
            const params = new URLSearchParams();
            if (permanent) params.append('permanent', 'true');

            const response = await fetch(`/api/notes/${noteId}?${params.toString()}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            setNote(null);
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    }, [noteId]);

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
            setNote(updatedNote);
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    }, [noteId]);

    return { note, loading, error, refetch: fetchNote, updateNote, deleteNote, restoreNote };
}

interface CreateNoteData {
    title?: string;
    content?: string;
    notebookId?: string;
    tags?: string[];
}

export function useCreateNote() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createNote = useCallback(async (data: CreateNoteData): Promise<Note | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/notes`, {
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

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { createNote, loading, error };
}

export function useToggleFavorite() {
    const toggleFavorite = useCallback(async (noteId: string, isFavorite: boolean): Promise<void> => {
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFavorite }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle favorite');
            }
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    }, []);

    return { toggleFavorite };
}
