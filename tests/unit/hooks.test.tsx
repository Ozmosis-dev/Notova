/**
 * Unit Tests for Custom React Hooks
 * 
 * Tests useTags, useNotes, and useNotebooks hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import hooks after mocking
import { useTags, useTagActions, useNoteTagActions } from '@/hooks/useTags';

describe('useTags Hook', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('fetches tags on mount', async () => {
        const mockTags = {
            tags: [
                { id: '1', name: 'Work', noteCount: 5, createdAt: '2024-01-01' },
                { id: '2', name: 'Personal', noteCount: 3, createdAt: '2024-01-02' },
            ],
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockTags),
        });

        const { result } = renderHook(() => useTags());

        // Initially loading
        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tags).toHaveLength(2);
        expect(result.current.tags?.[0]?.name).toBe('Work');
        expect(result.current.error).toBeNull();
    });

    it('handles API errors gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
        });

        const { result } = renderHook(() => useTags());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tags).toEqual([]);
        expect(result.current.error).toBeInstanceOf(Error);
    });

    it('handles empty tags response', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ tags: [] }),
        });

        const { result } = renderHook(() => useTags());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tags).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('refetch function works correctly', async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ tags: [{ id: '1', name: 'First', noteCount: 1, createdAt: '2024-01-01' }] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    tags: [
                        { id: '1', name: 'First', noteCount: 1, createdAt: '2024-01-01' },
                        { id: '2', name: 'Second', noteCount: 2, createdAt: '2024-01-02' },
                    ]
                }),
            });

        const { result } = renderHook(() => useTags());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.tags).toHaveLength(1);

        // Refetch
        await result.current.refetch();

        await waitFor(() => {
            expect(result.current.tags).toHaveLength(2);
        });
    });
});

describe('useTagActions Hook', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('creates a tag successfully', async () => {
        const newTag = { id: '1', name: 'NewTag', noteCount: 0, createdAt: '2024-01-01' };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(newTag),
        });

        const { result } = renderHook(() => useTagActions());

        const createdTag = await result.current.createTag('NewTag');

        expect(mockFetch).toHaveBeenCalledWith('/api/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'NewTag' }),
        });
        expect(createdTag).toEqual(newTag);
    });

    it('handles tag creation failure', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
        });

        const { result } = renderHook(() => useTagActions());

        const createdTag = await result.current.createTag('Invalid');

        expect(createdTag).toBeNull();
        // Error state is set asynchronously, wait for it
        await waitFor(() => {
            expect(result.current.error).toBeInstanceOf(Error);
        });
    });

    it('deletes a tag successfully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        });

        const { result } = renderHook(() => useTagActions());

        const success = await result.current.deleteTag('tag-123');

        expect(mockFetch).toHaveBeenCalledWith('/api/tags/tag-123', {
            method: 'DELETE',
        });
        expect(success).toBe(true);
    });
});

describe('useNoteTagActions Hook', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('adds a tag to a note', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        });

        const { result } = renderHook(() => useNoteTagActions());

        const success = await result.current.addTagToNote('note-123', 'NewTag');

        expect(mockFetch).toHaveBeenCalledWith('/api/notes/note-123', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addTags: ['NewTag'] }),
        });
        expect(success).toBe(true);
    });

    it('removes a tag from a note', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        });

        const { result } = renderHook(() => useNoteTagActions());

        const success = await result.current.removeTagFromNote('note-123', 'tag-456');

        expect(mockFetch).toHaveBeenCalledWith('/api/notes/note-123', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeTags: ['tag-456'] }),
        });
        expect(success).toBe(true);
    });
});
