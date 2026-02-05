'use client';

import { useState, useCallback } from 'react';
import { useNoteTagActions, useTagActions } from './useTags';

interface SuggestedTag {
    name: string;
    reason: string;
    noteCount: number;
}

interface UseSmartTagsReturn {
    suggestedTags: SuggestedTag[];
    selectedTags: Set<string>;
    loading: boolean;
    applying: boolean;
    error: string | null;
    modalOpen: boolean;
    noteIds: string[];
    generateSmartTags: (noteIds: string[], existingTags?: string[]) => Promise<void>;
    toggleTag: (tagName: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    applyTags: () => Promise<boolean>;
    closeModal: () => void;
    reset: () => void;
}

export function useSmartTags(): UseSmartTagsReturn {
    const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [noteIds, setNoteIds] = useState<string[]>([]);

    const { addTagToNote } = useNoteTagActions();
    const { createTag } = useTagActions();

    const generateSmartTags = useCallback(async (ids: string[], existingTags?: string[]) => {
        try {
            setNoteIds(ids);
            setModalOpen(true);
            setLoading(true);
            setError(null);
            setSuggestedTags([]);
            setSelectedTags(new Set());

            const response = await fetch('/api/ai/smart-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteIds: ids, existingTags }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate suggestions');
            }

            const data = await response.json();
            setSuggestedTags(data.suggestedTags || []);
            // Select all tags by default
            setSelectedTags(new Set((data.suggestedTags || []).map((t: SuggestedTag) => t.name)));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleTag = useCallback((tagName: string) => {
        setSelectedTags(prev => {
            const next = new Set(prev);
            if (next.has(tagName)) {
                next.delete(tagName);
            } else {
                next.add(tagName);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedTags(new Set(suggestedTags.map(t => t.name)));
    }, [suggestedTags]);

    const deselectAll = useCallback(() => {
        setSelectedTags(new Set());
    }, []);

    const applyTags = useCallback(async (): Promise<boolean> => {
        if (selectedTags.size === 0 || noteIds.length === 0) return false;

        try {
            setApplying(true);
            setError(null);

            // Get the tags that need to be applied
            const tagsToApply = suggestedTags.filter(t => selectedTags.has(t.name));

            // Apply each tag to the relevant notes
            for (const tag of tagsToApply) {
                // Create the tag if it doesn't exist
                await createTag(tag.name);

                // Add tag to each note
                for (const noteId of noteIds) {
                    await addTagToNote(noteId, tag.name);
                }
            }

            setModalOpen(false);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to apply tags');
            return false;
        } finally {
            setApplying(false);
        }
    }, [selectedTags, suggestedTags, noteIds, createTag, addTagToNote]);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setError(null);
    }, []);

    const reset = useCallback(() => {
        setSuggestedTags([]);
        setSelectedTags(new Set());
        setLoading(false);
        setApplying(false);
        setError(null);
        setModalOpen(false);
        setNoteIds([]);
    }, []);

    return {
        suggestedTags,
        selectedTags,
        loading,
        applying,
        error,
        modalOpen,
        noteIds,
        generateSmartTags,
        toggleTag,
        selectAll,
        deselectAll,
        applyTags,
        closeModal,
        reset,
    };
}

export default useSmartTags;
