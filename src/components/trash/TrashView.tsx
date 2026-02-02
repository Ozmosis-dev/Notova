'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '../ui/Spinner';
import { Modal } from '../ui/Modal';
import { OpenMoji } from '../ui/OpenMoji';
import { getCardColorStyle, type CardColorKey } from '../notes/ColorPickerPopup';

interface TrashedNote {
    id: string;
    title: string;
    icon?: string | null;
    cardColor?: string | null;
    trashedAt?: string | null;
    preview?: string | null;
}

interface TrashViewProps {
    trashedNotes: TrashedNote[];
    loading?: boolean;
    onNoteSelect?: (id: string) => void;
    onNoteRestore?: (id: string) => Promise<void>;
    onNoteDelete?: (id: string) => Promise<void>;
    onEmptyTrash?: () => Promise<void>;
    onClose?: () => void;
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

function formatTimeAgo(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

function getDaysRemaining(dateStr: string | null | undefined): number {
    if (!dateStr) return 30;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays);
}

export function TrashView({
    trashedNotes,
    loading = false,
    onNoteSelect,
    onNoteRestore,
    onNoteDelete,
    onEmptyTrash,
    onClose,
}: TrashViewProps) {
    const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
    const [isEmptying, setIsEmptying] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleRestore = useCallback(async (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation();
        if (restoringId || !onNoteRestore) return;
        setRestoringId(noteId);
        try {
            await onNoteRestore(noteId);
        } finally {
            setRestoringId(null);
        }
    }, [onNoteRestore, restoringId]);

    const handleDelete = useCallback(async (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation();
        if (deletingId || !onNoteDelete) return;
        if (!confirm('Permanently delete this note? This cannot be undone.')) return;
        setDeletingId(noteId);
        try {
            await onNoteDelete(noteId);
        } finally {
            setDeletingId(null);
        }
    }, [onNoteDelete, deletingId]);

    const handleEmptyTrash = async () => {
        if (isEmptying || !onEmptyTrash) return;
        setIsEmptying(true);
        try {
            await onEmptyTrash();
            setShowEmptyConfirm(false);
        } finally {
            setIsEmptying(false);
        }
    };

    return (
        <>
            <div
                className="w-full h-full flex flex-col transition-colors relative overflow-hidden"
                style={{
                    background: 'var(--surface-content)',
                }}
            >
                {/* Header */}
                <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                    <div className="flex items-center gap-3">
                        {onClose && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                    background: 'var(--surface-content-secondary)',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </motion.button>
                        )}
                        <h2
                            className="font-bold"
                            style={{
                                fontSize: 'var(--font-heading)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            Trash
                            <span
                                className="ml-2 font-normal"
                                style={{
                                    fontSize: 'var(--font-small)',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                ({trashedNotes.length})
                            </span>
                        </h2>
                    </div>

                    {/* Empty Trash Button */}
                    {trashedNotes.length > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowEmptyConfirm(true)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'rgb(239, 68, 68)',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            Empty Trash
                        </motion.button>
                    )}
                </div>

                {/* 30-day policy notice */}
                <div
                    className="px-5 py-2 text-xs flex items-center gap-2"
                    style={{
                        background: 'var(--surface-content-secondary)',
                        color: 'var(--text-muted)',
                        borderBottom: '1px solid var(--border-subtle)'
                    }}
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ flexShrink: 0 }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <span>Notes in trash are automatically deleted after 30 days</span>
                </div>

                {/* Notes Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : trashedNotes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-12 px-4 text-center"
                        >
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                                style={{
                                    background: 'var(--surface-content-secondary)',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                <svg
                                    className="w-10 h-10"
                                    style={{ color: 'var(--text-muted)' }}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <p
                                className="text-sm font-medium mb-1"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                Trash is empty
                            </p>
                            <p
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Deleted notes will appear here
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            <AnimatePresence mode="popLayout">
                                {trashedNotes.map((note, index) => {
                                    const noteCardColor = note.cardColor as CardColorKey;
                                    const bgColor = getCardColorStyle(noteCardColor);
                                    const isDarkCard = noteCardColor === 'black' || noteCardColor === 'navy' || noteCardColor === 'purple';
                                    const isDefaultCard = !noteCardColor || noteCardColor === 'default';
                                    const textColor = isDarkCard
                                        ? 'var(--text-on-dark)'
                                        : isDefaultCard
                                            ? 'var(--text-primary)'
                                            : 'var(--text-on-accent)';
                                    const daysRemaining = getDaysRemaining(note.trashedAt);
                                    const isRestoring = restoringId === note.id;
                                    const isDeleting = deletingId === note.id;

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
                                                className="w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden group opacity-75 hover:opacity-100"
                                                style={{
                                                    background: bgColor,
                                                    color: textColor,
                                                    boxShadow: 'var(--shadow-lg)',
                                                    minHeight: '140px',
                                                }}
                                            >
                                                {/* Action buttons */}
                                                <div className="absolute bottom-2 right-2 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-all z-50 flex gap-1.5">
                                                    {/* Restore button */}
                                                    <div
                                                        onClick={(e) => handleRestore(e, note.id)}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:bg-green-500/30"
                                                            style={{
                                                                background: isDarkCard
                                                                    ? 'rgba(255,255,255,0.15)'
                                                                    : isDefaultCard
                                                                        ? 'rgba(0,0,0,0.12)'
                                                                        : 'rgba(0,0,0,0.08)',
                                                                backdropFilter: 'blur(4px)'
                                                            }}
                                                            title="Restore note"
                                                        >
                                                            {isRestoring ? (
                                                                <Spinner size="sm" />
                                                            ) : (
                                                                <svg
                                                                    className="w-4 h-4 transition-colors"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    style={{ opacity: 0.7 }}
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Delete forever button */}
                                                    <div
                                                        onClick={(e) => handleDelete(e, note.id)}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:bg-red-500/30"
                                                            style={{
                                                                background: isDarkCard
                                                                    ? 'rgba(255,255,255,0.15)'
                                                                    : isDefaultCard
                                                                        ? 'rgba(0,0,0,0.12)'
                                                                        : 'rgba(0,0,0,0.08)',
                                                                backdropFilter: 'blur(4px)'
                                                            }}
                                                            title="Delete forever"
                                                        >
                                                            {isDeleting ? (
                                                                <Spinner size="sm" />
                                                            ) : (
                                                                <svg
                                                                    className="w-4 h-4 transition-colors"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    style={{ opacity: 0.7 }}
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Content */}
                                                <div className="relative z-1 flex flex-col h-full">
                                                    {/* Note Icon */}
                                                    <div className="mb-3">
                                                        {note.icon ? (
                                                            <OpenMoji hexcode={note.icon} size={32} />
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
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Note Title */}
                                                    <h3
                                                        className="font-semibold text-sm line-clamp-2 mb-1"
                                                        style={{ color: 'inherit' }}
                                                    >
                                                        {note.title || 'Untitled'}
                                                    </h3>

                                                    {/* Preview Text */}
                                                    {note.preview && (
                                                        <p
                                                            className="text-xs line-clamp-2 mb-2"
                                                            style={{
                                                                color: isDarkCard
                                                                    ? 'rgba(255,255,255,0.6)'
                                                                    : isDefaultCard
                                                                        ? 'var(--text-secondary)'
                                                                        : 'rgba(0,0,0,0.6)'
                                                            }}
                                                        >
                                                            {note.preview}
                                                        </p>
                                                    )}

                                                    {/* Time info */}
                                                    <div className="mt-auto flex flex-col gap-1">
                                                        <span
                                                            className="text-[10px]"
                                                            style={{ color: 'var(--text-muted)' }}
                                                        >
                                                            {formatTimeAgo(note.trashedAt)}
                                                        </span>
                                                        <span
                                                            className="text-[10px] font-medium"
                                                            style={{
                                                                color: daysRemaining <= 7
                                                                    ? 'rgb(239, 68, 68)'
                                                                    : 'var(--text-muted)'
                                                            }}
                                                        >
                                                            {daysRemaining === 0
                                                                ? 'Expires today'
                                                                : `Expires in ${daysRemaining} days`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Empty Trash Confirmation Modal */}
            <Modal
                isOpen={showEmptyConfirm}
                onClose={() => setShowEmptyConfirm(false)}
                title="Empty Trash"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Are you sure you want to <strong style={{ color: 'var(--text-primary)' }}>permanently delete</strong> all {trashedNotes.length} notes in the trash?
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(239, 68, 68, 0.9)' }}>
                        ⚠️ This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={() => setShowEmptyConfirm(false)}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                            style={{
                                background: 'var(--surface-content-secondary)',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEmptyTrash}
                            disabled={isEmptying}
                            className="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                            style={{
                                background: 'rgb(239, 68, 68)',
                                color: 'white',
                                opacity: isEmptying ? 0.7 : 1
                            }}
                        >
                            {isEmptying && <Spinner size="sm" />}
                            Empty Trash
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
