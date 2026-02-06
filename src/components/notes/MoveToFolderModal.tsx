'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../ui/Modal';

interface Notebook {
    id: string;
    name: string;
    icon?: string | null;
    noteCount?: number;
}

interface MoveToFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    notebooks: Notebook[];
    currentNotebookId?: string | null;
    onMove: (notebookId: string) => Promise<void>;
    noteCount?: number; // Number of notes being moved
    isMoving?: boolean;
}

export function MoveToFolderModal({
    isOpen,
    onClose,
    notebooks,
    currentNotebookId,
    onMove,
    noteCount = 1,
    isMoving = false,
}: MoveToFolderModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

    // Filter notebooks based on search query
    const filteredNotebooks = useMemo(() => {
        if (!searchQuery.trim()) return notebooks;
        const query = searchQuery.toLowerCase();
        return notebooks.filter(notebook =>
            notebook.name.toLowerCase().includes(query)
        );
    }, [notebooks, searchQuery]);

    const handleMove = async () => {
        if (!selectedNotebookId) return;
        await onMove(selectedNotebookId);
        setSelectedNotebookId(null);
        setSearchQuery('');
    };

    const handleClose = () => {
        setSelectedNotebookId(null);
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={noteCount > 1 ? `Move ${noteCount} Notes` : 'Move to Folder'}
            size="sm"
        >
            <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notebooks..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                        style={{
                            background: 'var(--surface-shell)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow-soft)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Notebooks List */}
                <div
                    className="max-h-64 overflow-y-auto rounded-xl"
                    style={{
                        border: '1px solid var(--border-primary)',
                        background: 'var(--surface-shell)',
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {filteredNotebooks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-4 py-8 text-center text-sm"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                No notebooks found
                            </motion.div>
                        ) : (
                            filteredNotebooks.map((notebook, index) => {
                                const isCurrent = notebook.id === currentNotebookId;
                                const isSelected = notebook.id === selectedNotebookId;

                                return (
                                    <motion.button
                                        key={notebook.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ delay: index * 0.02 }}
                                        onClick={() => !isCurrent && setSelectedNotebookId(notebook.id)}
                                        disabled={isCurrent || isMoving}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 text-left transition-all
                                            ${isCurrent ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                                        `}
                                        style={{
                                            background: isSelected
                                                ? 'var(--accent-glow-soft)'
                                                : 'transparent',
                                            borderBottom: index < filteredNotebooks.length - 1
                                                ? '1px solid var(--border-subtle)'
                                                : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isCurrent && !isSelected) {
                                                e.currentTarget.style.background = 'var(--surface-content-secondary)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        {/* Notebook Icon */}
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{
                                                background: isSelected
                                                    ? 'var(--accent-primary)'
                                                    : 'rgba(255, 255, 255, 0.08)',
                                            }}
                                        >
                                            {notebook.icon ? (
                                                <span className="text-base">{notebook.icon}</span>
                                            ) : (
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke={isSelected ? 'white' : 'currentColor'}
                                                    viewBox="0 0 24 24"
                                                    style={{ color: isSelected ? 'white' : 'var(--text-secondary)' }}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Notebook Name */}
                                        <div className="flex-1 min-w-0">
                                            <span
                                                className="text-sm font-medium truncate block"
                                                style={{
                                                    color: isSelected
                                                        ? 'var(--accent-primary)'
                                                        : 'var(--text-primary)',
                                                }}
                                            >
                                                {notebook.name}
                                            </span>
                                            {notebook.noteCount !== undefined && (
                                                <span
                                                    className="text-xs"
                                                    style={{ color: 'var(--text-muted)' }}
                                                >
                                                    {notebook.noteCount} {notebook.noteCount === 1 ? 'note' : 'notes'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Current Badge */}
                                        {isCurrent && (
                                            <span
                                                className="text-xs px-2 py-1 rounded-full"
                                                style={{
                                                    background: 'var(--surface-content-secondary)',
                                                    color: 'var(--text-muted)',
                                                }}
                                            >
                                                Current
                                            </span>
                                        )}

                                        {/* Selected Checkmark */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                                style={{ background: 'var(--accent-primary)' }}
                                            >
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-2">
                    <button
                        onClick={handleClose}
                        disabled={isMoving}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{
                            background: 'var(--surface-shell)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-primary)',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMove}
                        disabled={!selectedNotebookId || isMoving}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{
                            background: selectedNotebookId
                                ? 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
                                : 'var(--surface-content-secondary)',
                            color: selectedNotebookId ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        {isMoving ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                />
                                Moving...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                </svg>
                                Move
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
