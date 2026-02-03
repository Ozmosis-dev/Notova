'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '../ui/Spinner';
import { OpenMoji } from '../ui/OpenMoji';
import { ColorPickerPopup, getCardColorStyle, type CardColorKey } from './ColorPickerPopup';
import { AISearchInsightsButton } from '../ai/AISearchInsightsButton';
import { Sparkles, Loader2 } from 'lucide-react';

// Filter chip options
const filterOptions = [
    { id: 'all', label: 'ALL', count: null },
    { id: 'a-z', label: 'A-Z', count: null },
    { id: 'date', label: 'DATE', count: null },
    { id: 'tags', label: 'TAGS', count: null },
    { id: 'favorites', label: 'FAVORITES', count: null, isIcon: true },
];

interface NotePreview {
    id: string;
    title: string;
    icon?: string | null;
    cardColor?: string | null;
    preview: string;
    updatedAt: Date | string;
    isTrash?: boolean;
    isFavorite?: boolean;
    tags?: Array<{ id: string; name: string }>;
}

interface Tag {
    id: string;
    name: string;
    noteCount: number;
}

interface NotesListProps {
    notes: NotePreview[];
    selectedNoteId?: string | null;
    onNoteSelect?: (id: string) => void;
    onNoteColorChange?: (noteId: string, color: CardColorKey) => void;
    onToggleFavorite?: (noteId: string) => void;
    onNewNote?: () => void;
    loading?: boolean;
    emptyMessage?: string;
    fullPanel?: boolean;
    notebookName?: string; // When provided, shows notebook context in header
    notebookId?: string | null; // Notebook ID for AI summarization
    onBack?: () => void; // Callback for back button navigation
    // AI Search Insights props
    searchQuery?: string;
    onGenerateSearchInsights?: () => void;
    isGeneratingInsights?: boolean;
    // AI Notebook Summarization props
    onSummarizeNotebook?: (notebookId: string, notebookName: string) => void;
    isSummarizingNotebook?: boolean;
    // Tags filter props
    allTags?: Tag[];
}

function formatRelativeDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            if (diffMinutes < 1) return 'Just now';
            return `${diffMinutes}m ago`;
        }
        return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.05,
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        },
    }),
};

export function NotesList({
    notes,
    selectedNoteId,
    onNoteSelect,
    onNoteColorChange,
    onToggleFavorite,
    onNewNote,
    loading = false,
    emptyMessage = 'No notes yet',
    fullPanel = false,
    notebookName,
    notebookId,
    onBack,
    searchQuery,
    onGenerateSearchInsights,
    isGeneratingInsights = false,
    onSummarizeNotebook,
    isSummarizingNotebook = false,
    allTags = [],
}: NotesListProps) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [colorPickerNoteId, setColorPickerNoteId] = useState<string | null>(null);
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
    const [isCreatingNote, setIsCreatingNote] = useState(false);

    // Sort notes based on active filter
    const sortedNotes = useMemo(() => {
        let notesCopy = [...notes];

        // Filter for favorites first
        if (activeFilter === 'favorites') {
            notesCopy = notesCopy.filter(note => note.isFavorite);
        }

        // Filter by selected tag when tags filter is active
        if (activeFilter === 'tags' && selectedTagId) {
            notesCopy = notesCopy.filter(note =>
                note.tags?.some(tag => tag.id === selectedTagId)
            );
        }

        if (activeFilter === 'date') {
            // Sort by date, most recent first
            return notesCopy.sort((a, b) => {
                const dateA = new Date(a.updatedAt).getTime();
                const dateB = new Date(b.updatedAt).getTime();
                return dateB - dateA; // Descending order (newest first)
            });
        } else if (activeFilter === 'a-z') {
            // Sort alphabetically by title
            return notesCopy.sort((a, b) => {
                return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
            });
        }

        // 'all' or 'favorites' - return original order (or filtered)
        return notesCopy;
    }, [notes, activeFilter, selectedTagId]);

    return (
        <div
            className={`${fullPanel ? 'flex-1' : 'w-full md:w-96 shrink-0'} flex flex-col transition-colors relative`}
            style={{
                background: 'var(--surface-content)',
                borderRight: fullPanel ? 'none' : '1px solid var(--border-primary)'
            }}
        >
            {/* Header with editorial styling */}
            <div
                className="px-5 py-4"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
                {notebookName ? (
                    /* Notebook context header with back button and AI insights */
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <motion.button
                                whileHover={{ scale: 1.05, x: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onBack}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0"
                                style={{
                                    background: 'var(--surface-content-secondary)',
                                    color: 'var(--text-primary)'
                                }}
                                aria-label="Back to notebooks"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>
                            <h2
                                className="font-bold truncate"
                                style={{
                                    fontSize: 'var(--font-heading)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {notebookName}
                                <span
                                    className="ml-2 font-normal"
                                    style={{
                                        fontSize: 'var(--font-small)',
                                        color: 'var(--text-muted)'
                                    }}
                                >
                                    ({notes.length})
                                </span>
                            </h2>
                        </div>
                        {/* AI Summarize Notebook button */}
                        {notes.length >= 1 && notebookId && onSummarizeNotebook && (
                            <motion.button
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSummarizeNotebook(notebookId, notebookName)}
                                disabled={isSummarizingNotebook}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0"
                                style={{
                                    background: isSummarizingNotebook
                                        ? 'var(--ai-gradient-primary)'
                                        : 'var(--surface-content-secondary)',
                                    color: isSummarizingNotebook
                                        ? 'var(--text-on-accent)'
                                        : 'var(--text-primary)',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: '1px solid var(--border-subtle)',
                                    opacity: isSummarizingNotebook ? 0.9 : 1
                                }}
                                title={`Summarize ${notebookName} with AI`}
                            >
                                {isSummarizingNotebook ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
                                )}
                                <span>AI Summary</span>
                            </motion.button>
                        )}
                    </div>
                ) : (
                    /* Regular notes header with optional AI insights button */
                    <div className="flex items-center justify-between gap-3">
                        <h2
                            className="font-bold"
                            style={{
                                fontSize: 'var(--font-heading)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            {searchQuery ? 'Search Results' : 'Notes'}
                            <span
                                className="ml-2 font-normal"
                                style={{
                                    fontSize: 'var(--font-small)',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                ({notes.length})
                            </span>
                        </h2>
                        {/* AI Search Insights button - shown when search has 2+ results */}
                        {searchQuery && notes.length >= 2 && onGenerateSearchInsights && (
                            <AISearchInsightsButton
                                onClick={onGenerateSearchInsights}
                                isLoading={isGeneratingInsights}
                                matchCount={notes.length}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Filter Chips Row */}
            <div
                className="px-5 py-3 flex gap-2 overflow-x-auto hide-scrollbar"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
                {filterOptions.map((filter) => {
                    const isActive = activeFilter === filter.id;
                    const isFavoritesFilter = filter.id === 'favorites';

                    return (
                        <motion.button
                            key={filter.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                setActiveFilter(filter.id);
                                // Clear tag selection when switching away from tags filter
                                if (filter.id !== 'tags') {
                                    setSelectedTagId(null);
                                }
                            }}
                            className={`${isFavoritesFilter ? 'p-2' : 'px-4 py-2'} rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center justify-center`}
                            style={{
                                background: isActive
                                    ? 'var(--text-primary)'
                                    : 'transparent',
                                color: isActive
                                    ? 'var(--surface-content)'
                                    : 'var(--text-secondary)',
                                border: isActive
                                    ? 'none'
                                    : '1px solid var(--border-primary)',
                                minHeight: '40px',
                                minWidth: isFavoritesFilter ? '40px' : 'auto',
                            }}
                        >
                            {isFavoritesFilter ? (
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 97.6 96.4"
                                    fill="none"
                                    style={{ opacity: isActive ? 1 : 0.7 }}
                                >
                                    <defs>
                                        <linearGradient id="filterSparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: 'var(--accent-primary)' }} />
                                            <stop offset="100%" style={{ stopColor: 'var(--accent-secondary)' }} />
                                        </linearGradient>
                                    </defs>
                                    <path d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" fill="url(#filterSparkleGradient)" />
                                </svg>
                            ) : (
                                filter.label
                            )}
                            {filter.count !== null && (
                                <span
                                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                                    style={{
                                        background: isActive
                                            ? 'var(--highlight)'
                                            : 'var(--surface-content-secondary)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {filter.count}
                                </span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Tags Sub-Row - Expandable when tags filter is active */}
            <AnimatePresence>
                {activeFilter === 'tags' && allTags.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        style={{
                            overflow: 'hidden',
                            borderBottom: '1px solid var(--border-subtle)'
                        }}
                    >
                        <div className="px-5 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
                            {selectedTagId && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedTagId(null)}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0"
                                    style={{
                                        background: 'transparent',
                                        color: 'var(--accent-primary)',
                                        border: '1px solid var(--accent-primary)',
                                    }}
                                >
                                    Clear Filter
                                </motion.button>
                            )}
                            {/* Tag chips */}
                            {allTags.map((tag) => {
                                const isSelected = selectedTagId === tag.id;
                                return (
                                    <motion.button
                                        key={tag.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedTagId(isSelected ? null : tag.id)}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0"
                                        style={{
                                            background: isSelected
                                                ? 'var(--text-primary)'
                                                : 'transparent',
                                            color: isSelected
                                                ? 'var(--surface-content)'
                                                : 'var(--text-secondary)',
                                            border: isSelected
                                                ? 'none'
                                                : '1px solid var(--border-primary)',
                                        }}
                                    >
                                        <span>{tag.name}</span>
                                        <span
                                            className="px-1.5 py-0.5 rounded-full text-[10px]"
                                            style={{
                                                background: isSelected
                                                    ? 'var(--surface-content-secondary)'
                                                    : 'var(--surface-content-tertiary)',
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            {tag.noteCount}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notes Grid */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : sortedNotes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-12 px-4 text-center"
                    >
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                            style={{
                                background: 'var(--surface-content-secondary)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <svg
                                className="w-10 h-10"
                                style={{ color: 'var(--text-muted)' }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {emptyMessage}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onNewNote}
                            className="mt-5 px-5 py-3 text-sm font-semibold rounded-2xl transition-all"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                color: 'var(--text-on-accent)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            Create your first note
                        </motion.button>
                    </motion.div>
                ) : (
                    /* Masonry-style grid - more columns in full panel mode */
                    <div className={`grid gap-3 ${fullPanel ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'grid-cols-2'}`}>
                        <AnimatePresence mode="popLayout">
                            {sortedNotes.map((note, index) => {
                                // Use note's cardColor if set, otherwise fall back to default transparent
                                const noteCardColor = note.cardColor as CardColorKey;
                                const bgColor = getCardColorStyle(noteCardColor);
                                // Determine text color based on card background
                                // Default/transparent cards use primary text, dark cards use white, colored cards use dark text
                                const isDarkCard = noteCardColor === 'black' || noteCardColor === 'navy' || noteCardColor === 'purple';
                                const isDefaultCard = !noteCardColor || noteCardColor === 'default';
                                const textColor = isDarkCard
                                    ? 'var(--text-on-dark)'
                                    : isDefaultCard
                                        ? 'var(--text-primary)'
                                        : 'var(--text-on-accent)';
                                const isSelected = selectedNoteId === note.id;
                                const isColorPickerOpen = colorPickerNoteId === note.id;

                                return (
                                    <motion.div
                                        key={note.id}
                                        custom={index}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="relative"
                                    >
                                        <motion.button
                                            whileHover={{
                                                y: -4,
                                                scale: 1.02,
                                                transition: { duration: 0.2 }
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => onNoteSelect?.(note.id)}
                                            className="w-full text-left p-4 rounded-2xl transition-all relative group"
                                            style={{
                                                background: bgColor,
                                                color: textColor,
                                                boxShadow: isSelected
                                                    ? 'var(--shadow-xl), 0 0 0 3px var(--selection-ring)'
                                                    : 'var(--shadow-md)',
                                                minHeight: '140px',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Favorite sparkle indicator - top right corner */}
                                            {note.isFavorite && (
                                                <div
                                                    className="absolute top-3 right-3 z-10"
                                                    title="Favorite"
                                                >
                                                    <svg
                                                        className="w-5 h-5"
                                                        viewBox="0 0 97.6 96.4"
                                                        fill="none"
                                                    >
                                                        <defs>
                                                            <linearGradient id={`sparkleGradient-${note.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="0%" style={{ stopColor: 'var(--accent-primary)' }} />
                                                                <stop offset="100%" style={{ stopColor: 'var(--accent-secondary)' }} />
                                                            </linearGradient>
                                                        </defs>
                                                        <path
                                                            d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z"
                                                            fill={`url(#sparkleGradient-${note.id})`}
                                                            strokeWidth="0"
                                                        />
                                                    </svg>
                                                </div>
                                            )}




                                            {/* Icon and Title */}
                                            <div
                                                className="flex items-start gap-2 mb-2"
                                                style={{
                                                    paddingRight: note.isFavorite ? '28px' : '0'
                                                }}
                                            >
                                                {note.icon && (
                                                    <OpenMoji hexcode={note.icon} size={20} className="shrink-0 mt-0.5" />
                                                )}
                                                <h3
                                                    className="font-semibold line-clamp-2"
                                                    style={{
                                                        fontSize: 'var(--font-body)',
                                                        lineHeight: 'var(--leading-snug)'
                                                    }}
                                                >
                                                    {note.title || 'Untitled'}
                                                </h3>
                                            </div>

                                            {/* Preview - limit to 3 lines */}
                                            <p
                                                className="text-xs opacity-80 line-clamp-3"
                                                style={{ lineHeight: 'var(--leading-normal)' }}
                                            >
                                                {note.preview || 'No content'}
                                            </p>

                                            {/* Footer: Date with inline action icons */}
                                            <div className="flex items-center justify-between gap-1 mt-auto pt-2 pb-1 relative z-10">
                                                <span
                                                    className="text-xs opacity-70 tabular-nums shrink-0"
                                                >
                                                    {formatRelativeDate(note.updatedAt)}
                                                </span>

                                                {/* Action icons inline with timestamp */}
                                                <div className="flex items-center gap-1 opacity-70 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                                                    {/* Favorite button */}
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onToggleFavorite?.(note.id);
                                                        }}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:bg-white/40"
                                                            style={{
                                                                background: isDarkCard
                                                                    ? 'rgba(255,255,255,0.15)'
                                                                    : isDefaultCard
                                                                        ? 'rgba(0,0,0,0.12)'
                                                                        : 'rgba(0,0,0,0.08)',
                                                                backdropFilter: 'blur(4px)'
                                                            }}
                                                            title={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
                                                        >
                                                            <svg
                                                                className="w-3.5 h-3.5 transition-all"
                                                                viewBox="0 0 97.6 96.4"
                                                                style={{
                                                                    opacity: note.isFavorite ? 1 : 0.5,
                                                                    fill: note.isFavorite ? 'currentColor' : 'none',
                                                                    stroke: note.isFavorite ? 'none' : 'currentColor',
                                                                    strokeWidth: note.isFavorite ? 0 : 8
                                                                }}
                                                            >
                                                                <path d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Color picker button */}
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setColorPickerNoteId(isColorPickerOpen ? null : note.id);
                                                        }}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:bg-white/40"
                                                            style={{
                                                                background: isDarkCard
                                                                    ? 'rgba(255,255,255,0.15)'
                                                                    : isDefaultCard
                                                                        ? 'rgba(0,0,0,0.12)'
                                                                        : 'rgba(0,0,0,0.08)',
                                                                backdropFilter: 'blur(4px)'
                                                            }}
                                                            title="Change card color"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 transition-colors"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                                style={{ opacity: 0.7 }}
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tags Drawer - part of normal flow so cards grow with tag rows */}
                                            {note.tags && note.tags.length > 0 && (
                                                <div
                                                    className="-mx-4 -mb-4 mt-2 rounded-b-2xl overflow-hidden"
                                                    style={{
                                                        background: isDarkCard
                                                            ? 'rgba(0, 0, 0, 0.25)'
                                                            : isDefaultCard
                                                                ? 'var(--surface-content-secondary)'
                                                                : 'rgba(0, 0, 0, 0.15)',
                                                        backdropFilter: 'blur(8px)',
                                                        borderTop: isDarkCard
                                                            ? '1px solid rgba(255, 255, 255, 0.1)'
                                                            : '1px solid rgba(0, 0, 0, 0.08)'
                                                    }}
                                                >
                                                    <div className="px-3 py-2 flex gap-1.5 flex-wrap items-center">
                                                        {note.tags.map((tag) => (
                                                            <span
                                                                key={tag.id}
                                                                className="px-2 py-0.5 text-[10px] font-semibold rounded-full opacity-90"
                                                                style={{
                                                                    background: isDarkCard
                                                                        ? 'rgba(255, 255, 255, 0.15)'
                                                                        : 'rgba(0, 0, 0, 0.12)'
                                                                }}
                                                                title={tag.name}
                                                            >
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hover glow effect */}
                                            <div
                                                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                                                style={{
                                                    background: 'linear-gradient(135deg, white 0%, transparent 50%)'
                                                }}
                                            />
                                        </motion.button>

                                        {/* Color Picker Popup */}
                                        <ColorPickerPopup
                                            isOpen={isColorPickerOpen}
                                            currentColor={noteCardColor}
                                            onColorSelect={(color) => {
                                                onNoteColorChange?.(note.id, color);
                                            }}
                                            onClose={() => setColorPickerNoteId(null)}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Floating Action Button with premium elevation */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.3
                }}
                whileHover={{
                    scale: 1.08,
                    y: -2,
                    boxShadow: `
                        0 4px 16px -4px var(--accent-glow),
                        0 8px 24px -8px var(--accent-glow-soft),
                        0 0 0 2px rgba(255, 255, 255, 0.1)
                    `
                }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                    setIsCreatingNote(true);
                    onNewNote?.();
                    // Reset loading state after animation
                    setTimeout(() => setIsCreatingNote(false), 1000);
                }}
                className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-30"
                style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                    color: 'var(--text-on-accent)',
                    boxShadow: `
                        0 2px 8px -2px var(--accent-glow),
                        0 6px 16px -4px var(--accent-glow-soft),
                        0 0 0 1px rgba(255, 255, 255, 0.08)
                    `
                }}
                aria-label="Create new note"
            >
                {isCreatingNote ? (
                    <motion.svg
                        className="w-6 h-6"
                        viewBox="0 0 97.6 96.4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                    >
                        <defs>
                            <linearGradient id="sparkleGradientFab" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: 'var(--accent-primary)' }} />
                                <stop offset="100%" style={{ stopColor: 'var(--accent-secondary)' }} />
                            </linearGradient>
                        </defs>
                        <path
                            d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z"
                            fill="url(#sparkleGradientFab)"
                            strokeWidth="0"
                        />
                    </motion.svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="var(--text-on-accent)" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                )}
            </motion.button>
        </div >
    );
}
