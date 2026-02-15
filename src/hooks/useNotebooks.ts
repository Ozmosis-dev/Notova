'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notebook {
    id: string;
    name: string;
    isDefault: boolean;
    noteCount: number;
    createdAt: string;
    updatedAt: string;
    stackId?: string | null;
}

// TODO: Get from auth context
const DEFAULT_USER_ID = 'user-1';

interface UseNotebooksReturn {
    notebooks: Notebook[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useNotebooks(userId: string = DEFAULT_USER_ID): UseNotebooksReturn {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNotebooks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/notebooks?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch notebooks');
            }

            const data = await response.json();
            // Ensure we got an array back
            if (Array.isArray(data)) {
                setNotebooks(data);
            } else {
                // API returned an error object or unexpected format
                setNotebooks([]);
                if (data.error) {
                    throw new Error(data.error);
                }
            }
        } catch (err) {
            setNotebooks([]);
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotebooks();
    }, [fetchNotebooks]);

    return { notebooks, loading, error, refetch: fetchNotebooks };
}

interface CreateNotebookData {
    name: string;
    isDefault?: boolean;
    icon?: string;
    cardColor?: string;
    stackId?: string;
}

interface UseNotebookActionsReturn {
    createNotebook: (data: CreateNotebookData) => Promise<Notebook | null>;
    updateNotebook: (id: string, data: Partial<CreateNotebookData>) => Promise<Notebook | null>;
    deleteNotebook: (id: string, deleteNotes?: boolean) => Promise<boolean>;
    loading: boolean;
    error: Error | null;
}

export function useNotebookActions(userId: string = DEFAULT_USER_ID): UseNotebookActionsReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createNotebook = useCallback(async (data: CreateNotebookData): Promise<Notebook | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/notebooks?userId=${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to create notebook');
            }

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const updateNotebook = useCallback(async (id: string, data: Partial<CreateNotebookData>): Promise<Notebook | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/notebooks/${id}?userId=${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update notebook');
            }

            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const deleteNotebook = useCallback(async (id: string, deleteNotes: boolean = false): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            const url = deleteNotes
                ? `/api/notebooks/${id}?userId=${userId}&deleteNotes=true`
                : `/api/notebooks/${id}?userId=${userId}`;

            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notebook');
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            return false;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    return { createNotebook, updateNotebook, deleteNotebook, loading, error };
}
