'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '../ui/Spinner';
import { OpenMoji } from '../ui/OpenMoji';
import { ColorPickerPopup, getCardColorStyle, type CardColorKey } from '../notes/ColorPickerPopup';
import { Sparkles } from 'lucide-react';

interface Notebook {
    id: string;
    name: string;
    icon?: string | null;
    cardColor?: string | null;
    noteCount: number;
    isDefault?: boolean;
}

interface NotePreview {
    id: string;
    title: string;
    icon?: string | null;
    cardColor?: string | null;
    notebookId?: string; // Optional since notes might not have a notebook
    isTrash?: boolean; // To filter out trashed notes
}

interface NotebooksListProps {
    notebooks: Notebook[];
    notes?: NotePreview[]; // Notes for displaying previews
    selectedNotebookId?: string | null;
    onNotebookSelect?: (id: string | null) => void;
    onNotebookColorChange?: (notebookId: string, color: CardColorKey) => void;
    onNotebookDelete?: (notebookId: string) => void;
    onSummarizeNotebook?: (notebookId: string, notebookName: string) => void;
    isSummarizing?: boolean;
    summarizingNotebookId?: string | null;
    onNewNotebook?: () => void;
    loading?: boolean;
    fullPanel?: boolean; // When true, takes full width for grid view
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

export function NotebooksList({
    notebooks,
    notes = [],
    selectedNotebookId,
    onNotebookSelect,
    onNotebookColorChange,
    onNotebookDelete,
    onSummarizeNotebook,
    isSummarizing = false,
    summarizingNotebookId = null,
    onNewNotebook,
    loading = false,
    fullPanel = false,
}: NotebooksListProps) {
    const [colorPickerNotebookId, setColorPickerNotebookId] = useState<string | null>(null);
    const [pendingDeleteNotebook, setPendingDeleteNotebook] = useState<{ id: string; name: string } | null>(null);

    const handleDeleteConfirm = () => {
        if (pendingDeleteNotebook) {
            onNotebookDelete?.(pendingDeleteNotebook.id);
            setPendingDeleteNotebook(null);
        }
    };

    const handleDeleteCancel = () => {
        setPendingDeleteNotebook(null);
    };

    return (
        <div
            className={`w-full ${fullPanel ? 'flex-1' : 'md:w-96 shrink-0'} flex flex-col transition-colors relative`}
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
                <h2
                    className="font-bold"
                    style={{
                        fontSize: 'var(--font-heading)',
                        color: 'var(--text-primary)'
                    }}
                >
                    Notebooks
                    <span
                        className="ml-2 font-normal"
                        style={{
                            fontSize: 'var(--font-small)',
                            color: 'var(--text-muted)'
                        }}
                    >
                        ({notebooks.length})
                    </span>
                </h2>
            </div>

            {/* Notebooks Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : notebooks.length === 0 ? (
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            No notebooks yet
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onNewNotebook}
                            className="mt-5 px-5 py-3 text-sm font-semibold rounded-2xl transition-all"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                color: 'var(--text-on-accent)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            Create your first notebook
                        </motion.button>
                    </motion.div>
                ) : (
                    /* Responsive grid: larger cards with fewer columns */
                    <div className={`grid gap-4 ${fullPanel ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        <AnimatePresence mode="popLayout">
                            {notebooks.map((notebook, index) => {
                                // Use notebook's cardColor if set, otherwise fall back to default
                                const notebookCardColor = notebook.cardColor as CardColorKey;
                                const bgColor = getCardColorStyle(notebookCardColor);
                                // Determine text color based on card background
                                const isDarkCard = notebookCardColor === 'black' || notebookCardColor === 'navy' || notebookCardColor === 'purple';
                                const isDefaultCard = !notebookCardColor || notebookCardColor === 'default';
                                const textColor = isDarkCard
                                    ? 'var(--text-on-dark)'
                                    : isDefaultCard
                                        ? 'var(--text-primary)'
                                        : 'var(--text-on-accent)';
                                const isSelected = selectedNotebookId === notebook.id;
                                const isColorPickerOpen = colorPickerNotebookId === notebook.id;

                                // Get up to 4 notes for this notebook
                                const notebookNotes = notes.filter(n => !n.isTrash && n.notebookId === notebook.id).slice(0, 4);

                                return (
                                    <motion.div
                                        key={notebook.id}
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
                                            onClick={(e) => {
                                                // Don't navigate if clicking on action buttons
                                                const target = e.target as HTMLElement;
                                                const isActionButton = target.closest('div[role="button"]');
                                                if (!isActionButton) {
                                                    onNotebookSelect?.(notebook.id);
                                                }
                                            }}
                                            className="w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden group"
                                            style={{
                                                background: bgColor,
                                                color: textColor,
                                                boxShadow: isSelected
                                                    ? 'var(--shadow-xl), 0 0 0 3px var(--selection-ring)'
                                                    : 'var(--shadow-lg)',
                                                minHeight: '280px',
                                            }}
                                        >
                                            {/* Action buttons - always visible on mobile, hover on desktop */}
                                            <div className="absolute bottom-2 right-2 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all z-50 flex gap-1.5">
                                                {/* AI Summarize button - only show if notebook has notes */}
                                                {notebook.noteCount > 0 && onSummarizeNotebook && (
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        onPointerDown={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            onSummarizeNotebook(notebook.id, notebook.name);
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                onSummarizeNotebook(notebook.id, notebook.name);
                                                            }
                                                        }}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                                                        style={{
                                                            background: isSummarizing && summarizingNotebookId === notebook.id
                                                                ? 'var(--ai-gradient-primary)'
                                                                : isDarkCard
                                                                    ? 'rgba(255,255,255,0.15)'
                                                                    : isDefaultCard
                                                                        ? 'rgba(0,0,0,0.12)'
                                                                        : 'rgba(0,0,0,0.08)',
                                                            backdropFilter: 'blur(4px)'
                                                        }}
                                                        title="Summarize notebook with AI"
                                                    >
                                                        <Sparkles
                                                            size={14}
                                                            className={isSummarizing && summarizingNotebookId === notebook.id ? 'animate-pulse' : ''}
                                                            style={{ opacity: 0.7 }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Delete button */}
                                                {!notebook.isDefault && (
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        onPointerDown={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setPendingDeleteNotebook({ id: notebook.id, name: notebook.name });
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                setPendingDeleteNotebook({ id: notebook.id, name: notebook.name });
                                                            }
                                                        }}

                                                        className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:bg-red-500/30"
                                                        style={{
                                                            background: isDarkCard
                                                                ? 'rgba(255,255,255,0.15)'
                                                                : isDefaultCard
                                                                    ? 'rgba(0,0,0,0.12)'
                                                                    : 'rgba(0,0,0,0.08)',
                                                            backdropFilter: 'blur(4px)'
                                                        }}
                                                        title="Delete notebook"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 transition-colors"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            style={{ opacity: 0.7 }}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Color picker button */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setColorPickerNotebookId(isColorPickerOpen ? null : notebook.id);
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

                                            {/* Card Content */}
                                            <div className="relative z-1 flex flex-col h-full">
                                                {/* Notebook Icon */}
                                                <div className="mb-3">
                                                    {notebook.icon ? (
                                                        <OpenMoji hexcode={notebook.icon} size={32} />
                                                    ) : (
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                            style={{
                                                                background: 'var(--highlight-soft)',
                                                            }}
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                style={{ color: 'var(--accent-primary)' }}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Notebook Name */}
                                                <h3
                                                    className="font-semibold text-base line-clamp-2 mb-2"
                                                    style={{ color: 'inherit' }}
                                                >
                                                    {notebook.name}
                                                </h3>

                                                {/* Notes Preview Section */}
                                                <div className="mt-3 flex-1 min-h-0">
                                                    {notebookNotes.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {notebookNotes.map(note => {
                                                                const noteCardColor = note.cardColor as CardColorKey;
                                                                const noteIsDark = noteCardColor === 'black' || noteCardColor === 'navy' || noteCardColor === 'purple';
                                                                const noteIsDefault = !noteCardColor || noteCardColor === 'default';
                                                                const noteBgColor = getCardColorStyle(noteCardColor);
                                                                // If note has no color, inherit text color from parent notebook
                                                                const noteTextColor = noteIsDefault
                                                                    ? textColor // Inherit from notebook
                                                                    : noteIsDark
                                                                        ? 'var(--text-on-dark)'
                                                                        : 'var(--text-on-accent)';

                                                                return (
                                                                    <div
                                                                        key={note.id}
                                                                        className="p-2 rounded-lg flex items-center gap-2 text-xs transition-opacity hover:opacity-80"
                                                                        style={{
                                                                            background: noteBgColor,
                                                                            color: noteTextColor,
                                                                            opacity: 0.95
                                                                        }}
                                                                    >
                                                                        {note.icon && (
                                                                            <OpenMoji hexcode={note.icon} size={16} />
                                                                        )}
                                                                        <span className="truncate font-medium">{note.title}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p
                                                            className="text-xs italic"
                                                            style={{
                                                                color: isDarkCard ? 'var(--text-on-dark)' : 'var(--text-muted)',
                                                                opacity: 0.6
                                                            }}
                                                        >
                                                            No notes yet
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Note Count & Default Badge */}
                                                <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: `1px solid ${isDarkCard ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
                                                    <span
                                                        className="text-xs"
                                                        style={{ opacity: 0.7 }}
                                                    >
                                                        {notebook.noteCount} {notebook.noteCount === 1 ? 'note' : 'notes'}
                                                    </span>
                                                    {notebook.isDefault && (
                                                        <span
                                                            className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                                                            style={{
                                                                background: isDarkCard ? 'rgba(255,255,255,0.15)' : 'var(--highlight-soft)',
                                                                color: isDarkCard ? 'var(--text-on-dark)' : 'var(--accent-primary)'
                                                            }}
                                                        >
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Selection indicator */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-3 right-3 w-3 h-3 rounded-full"
                                                    style={{ background: 'var(--highlight)' }}
                                                />
                                            )}
                                        </motion.button>

                                        {/* Color Picker Popup */}
                                        <ColorPickerPopup
                                            isOpen={isColorPickerOpen}
                                            currentColor={notebookCardColor}
                                            onColorSelect={(color) => {
                                                onNotebookColorChange?.(notebook.id, color);
                                            }}
                                            onClose={() => setColorPickerNotebookId(null)}
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
                        0 8px 32px -4px rgba(255, 152, 0, 0.4),
                        0 16px 48px -8px rgba(255, 152, 0, 0.2),
                        0 0 0 2px rgba(255, 255, 255, 0.1)
                    `
                }}
                whileTap={{ scale: 0.92 }}
                onClick={onNewNotebook}
                className="absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-30"
                style={{
                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                    color: 'var(--text-on-accent)',
                    boxShadow: `
                        0 4px 16px -2px rgba(255, 152, 0, 0.35),
                        0 12px 32px -4px rgba(255, 152, 0, 0.15),
                        0 0 0 1px rgba(255, 255, 255, 0.08)
                    `
                }}
                aria-label="Create new notebook"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
            </motion.button>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {pendingDeleteNotebook && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
                        onClick={handleDeleteCancel}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                            style={{
                                background: 'var(--surface-content)',
                                border: '1px solid var(--border-subtle)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3
                                    className="font-semibold text-lg"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Delete Notebook
                                </h3>
                            </div>

                            <p
                                className="text-sm mb-6"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Are you sure you want to delete &quot;<strong style={{ color: 'var(--text-primary)' }}>{pendingDeleteNotebook.name}</strong>&quot;? Notes in this notebook will be moved to the default notebook.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                                    style={{
                                        background: 'var(--surface-content)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-primary)',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                                    style={{
                                        background: '#ef4444',
                                        color: 'white',
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
