'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface BulkActionsToolbarProps {
    selectedCount: number;
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onMove: () => void;
    onDelete: () => void;
    onSummarize?: () => void;
    onClose: () => void;
    isMoving?: boolean;
    isDeleting?: boolean;
    isSummarizing?: boolean;
}

export function BulkActionsToolbar({
    selectedCount,
    totalCount,
    onSelectAll,
    onDeselectAll,
    onMove,
    onDelete,
    onSummarize,
    onClose,
    isMoving = false,
    isDeleting = false,
    isSummarizing = false,
}: BulkActionsToolbarProps) {
    const isAllSelected = selectedCount === totalCount && totalCount > 0;
    const isProcessing = isMoving || isDeleting || isSummarizing;

    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 md:gap-4"
                    style={{
                        background: 'var(--surface-content)',
                        border: '1px solid var(--border-primary)',
                        backdropFilter: 'blur(16px)',
                        boxShadow: `
                            0 4px 24px -4px rgba(0, 0, 0, 0.3),
                            0 0 0 1px rgba(255, 255, 255, 0.05)
                        `,
                    }}
                >
                    {/* Selected Count */}
                    <div className="flex items-center gap-2 pr-2 md:pr-4 border-r" style={{ borderColor: 'var(--border-primary)' }}>
                        <motion.div
                            key={selectedCount}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                color: 'white',
                            }}
                        >
                            {selectedCount}
                        </motion.div>
                        <span
                            className="text-sm font-medium hidden sm:block"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            selected
                        </span>
                    </div>

                    {/* Select All / Deselect All */}
                    <button
                        onClick={isAllSelected ? onDeselectAll : onSelectAll}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] disabled:opacity-50 hidden md:block"
                        style={{
                            background: 'var(--surface-shell)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        {/* Move Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onMove}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                            style={{
                                background: 'var(--surface-shell)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-primary)',
                            }}
                            title="Move to folder"
                        >
                            {isMoving ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 rounded-full"
                                    style={{
                                        borderColor: 'var(--border-primary)',
                                        borderTopColor: 'var(--accent-primary)',
                                    }}
                                />
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                </svg>
                            )}
                            <span className="hidden sm:inline">Move</span>
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onDelete}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                            title="Delete notes"
                        >
                            {isDeleting ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 rounded-full"
                                    style={{
                                        borderColor: 'rgba(239, 68, 68, 0.3)',
                                        borderTopColor: '#ef4444',
                                    }}
                                />
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                            <span className="hidden sm:inline">Delete</span>
                        </motion.button>

                        {/* Summarize Button (AI) */}
                        {onSummarize && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onSummarize}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                    color: 'white',
                                }}
                                title="AI Summarize"
                            >
                                {isSummarizing ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 97.6 96.4" fill="currentColor">
                                        <path d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                                    </svg>
                                )}
                                <span className="hidden sm:inline">AI</span>
                            </motion.button>
                        )}
                    </div>

                    {/* Close Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        disabled={isProcessing}
                        className="ml-1 md:ml-2 p-2 rounded-lg transition-all disabled:opacity-50"
                        style={{ color: 'var(--text-muted)' }}
                        title="Exit selection mode"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
