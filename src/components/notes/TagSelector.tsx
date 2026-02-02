'use client';

import { useState, useRef, useEffect } from 'react';
import { useTags, useNoteTagActions, useTagActions } from '@/hooks/useTags';

interface Tag {
    id: string;
    name: string;
}

interface TagSelectorProps {
    noteId: string;
    currentTags: Tag[];
    onTagsChange?: (tags: Tag[]) => void;
    disabled?: boolean;
}

export function TagSelector({ noteId, currentTags, onTagsChange, disabled }: TagSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { tags: allTags, refetch: refetchTags } = useTags();
    const { addTagToNote, removeTagFromNote } = useNoteTagActions();
    const { createTag } = useTagActions();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter available tags (not already on this note)
    const availableTags = allTags.filter(
        tag => !currentTags.some(ct => ct.id === tag.id)
    );

    // Filter by search input
    const filteredTags = inputValue
        ? availableTags.filter(tag =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        : availableTags;

    // Check if input matches an existing tag name exactly
    const exactMatch = allTags.find(
        t => t.name.toLowerCase() === inputValue.toLowerCase()
    );

    const handleAddTag = async (tagName: string) => {
        if (!tagName.trim() || disabled) return;

        const success = await addTagToNote(noteId, tagName.trim());
        if (success) {
            // Find or create the tag object for local state
            const existingTag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
            if (existingTag) {
                onTagsChange?.([...currentTags, { id: existingTag.id, name: existingTag.name }]);
            } else {
                // Tag was just created, refetch to get the new ID
                await refetchTags();
                // For now, use a temporary ID - it will be replaced on next fetch
                onTagsChange?.([...currentTags, { id: `temp-${Date.now()}`, name: tagName.trim() }]);
            }
        }
        setInputValue('');
        setIsOpen(false);
    };

    const handleRemoveTag = async (tagId: string) => {
        if (disabled) return;

        const success = await removeTagFromNote(noteId, tagId);
        if (success) {
            onTagsChange?.(currentTags.filter(t => t.id !== tagId));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            handleAddTag(inputValue);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setInputValue('');
        }
    };

    const handleCreateNewTag = async () => {
        if (!inputValue.trim() || disabled) return;

        await createTag(inputValue.trim());
        await handleAddTag(inputValue);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Current Tags Display */}
            <div className="flex items-center flex-wrap gap-1.5">
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>

                {currentTags.map(tag => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-[#F6ECC9] text-[#8B6914] dark:bg-[#F7D44C]/40 dark:text-[#1a1a1a] border border-[#E8D4A0] dark:border-[#F7D44C]/60"
                    >
                        {tag.name}
                        {!disabled && (
                            <button
                                onClick={() => handleRemoveTag(tag.id)}
                                className="hover:text-[#B8860B] dark:hover:text-[#F7D44C] focus:outline-none"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </span>
                ))}

                {/* Add Tag Button */}
                {!disabled && (
                    <button
                        onClick={() => {
                            setIsOpen(!isOpen);
                            setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:border-[#FFA500] hover:text-[#E8783A] dark:hover:border-[#FFA500] dark:hover:text-[#FFA500] transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Tag
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className="absolute left-0 top-full mt-2 w-64 rounded-xl overflow-hidden z-50"
                    style={{
                        background: 'var(--surface-shell)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)',
                    }}
                >
                    {/* Search Input */}
                    <div
                        className="p-2 border-b"
                        style={{ borderColor: 'var(--border-subtle)' }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            placeholder="Search or create tag..."
                            className="w-full px-3 py-1.5 text-sm rounded-full focus:outline-none focus-visible:outline-none"
                            style={{
                                background: 'rgba(128, 128, 128, 0.08)',
                                border: isSearchFocused ? '1px solid #FFA500' : '1px solid var(--border-primary)',
                                color: 'var(--text-on-shell, var(--text-primary))',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Tags List */}
                    <div className="max-h-48 overflow-y-auto p-2">
                        {filteredTags.length > 0 ? (
                            <div className="space-y-1">
                                {filteredTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleAddTag(tag.name)}
                                        className="w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between group"
                                        style={{ color: 'var(--text-on-shell, var(--text-primary))' }}
                                    >
                                        <span>{tag.name}</span>
                                        <span
                                            className="text-xs"
                                            style={{ color: 'var(--text-on-shell-secondary, var(--text-muted))' }}
                                        >
                                            {tag.noteCount} {tag.noteCount === 1 ? 'note' : 'notes'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : inputValue && !exactMatch ? (
                            <button
                                onClick={handleCreateNewTag}
                                className="w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create "{inputValue}"
                            </button>
                        ) : (
                            <p
                                className="px-3 py-2 text-sm"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {availableTags.length === 0 ? 'All tags already added' : 'No matching tags'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
