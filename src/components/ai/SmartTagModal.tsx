'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Check, AlertCircle } from 'lucide-react';

interface SuggestedTag {
    name: string;
    reason: string;
    noteCount: number;
}

interface SmartTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestedTags: SuggestedTag[];
    selectedTags: Set<string>;
    onToggleTag: (tagName: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onApply: () => void;
    loading: boolean;
    applying: boolean;
    error: string | null;
    noteCount: number;
}

export function SmartTagModal({
    isOpen,
    onClose,
    suggestedTags,
    selectedTags,
    onToggleTag,
    onSelectAll,
    onDeselectAll,
    onApply,
    loading,
    applying,
    error,
    noteCount,
}: SmartTagModalProps) {
    const allSelected = suggestedTags.length > 0 && selectedTags.size === suggestedTags.length;
    const noneSelected = selectedTags.size === 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50"
                        style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4"
                    >
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                                background: 'var(--surface-shell)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            {/* Header - Clean and minimal */}
                            <div
                                className="px-5 py-4 flex items-center justify-between"
                                style={{
                                    borderBottom: '1px solid var(--border-subtle)',
                                }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                                    <h3
                                        className="font-semibold text-base"
                                        style={{ color: '#ffffff' }}
                                    >
                                        Smart Tags
                                    </h3>
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: 'rgba(255, 255, 255, 0.9)',
                                        }}
                                    >
                                        {noteCount} notes
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg transition-all hover:scale-110"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} />
                                        </motion.div>
                                        <p
                                            className="text-sm"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            Analyzing your notes...
                                        </p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                        <AlertCircle size={28} style={{ color: 'var(--error)' }} />
                                        <p
                                            className="text-sm text-center"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            {error}
                                        </p>
                                    </div>
                                ) : suggestedTags.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                        <Sparkles size={28} style={{ color: 'var(--text-muted)' }} />
                                        <p
                                            className="text-sm text-center"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            No suggestions available for these notes.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {suggestedTags.map((tag, index) => {
                                            const isSelected = selectedTags.has(tag.name);
                                            return (
                                                <motion.button
                                                    key={tag.name}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.04, duration: 0.2 }}
                                                    onClick={() => onToggleTag(tag.name)}
                                                    className="w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 group"
                                                    style={{
                                                        background: isSelected
                                                            ? 'var(--surface-content-secondary)'
                                                            : 'transparent',
                                                        border: '1px solid',
                                                        borderColor: isSelected
                                                            ? 'var(--accent-primary)'
                                                            : 'var(--border-subtle)',
                                                    }}
                                                >
                                                    {/* Elegant checkbox */}
                                                    <div
                                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all"
                                                        style={{
                                                            background: isSelected
                                                                ? 'var(--accent-primary)'
                                                                : 'transparent',
                                                            border: isSelected
                                                                ? 'none'
                                                                : '2px solid var(--border-primary)',
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                                                            >
                                                                <Check size={12} strokeWidth={3} style={{ color: 'var(--text-on-accent)' }} />
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {/* Tag info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="font-medium text-sm"
                                                                style={{ color: 'var(--text-primary)' }}
                                                            >
                                                                {tag.name}
                                                            </span>
                                                            <span
                                                                className="text-xs font-medium"
                                                                style={{ color: 'var(--text-muted)' }}
                                                            >
                                                                · {tag.noteCount}
                                                            </span>
                                                        </div>
                                                        <p
                                                            className="text-xs mt-1 leading-relaxed line-clamp-2"
                                                            style={{ color: 'var(--text-secondary)' }}
                                                        >
                                                            {tag.reason}
                                                        </p>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer - Clean action bar */}
                            {!loading && !error && suggestedTags.length > 0 && (
                                <div
                                    className="px-5 py-4 flex items-center justify-between"
                                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                                >
                                    <button
                                        onClick={allSelected ? onDeselectAll : onSelectAll}
                                        className="text-xs font-medium transition-opacity hover:opacity-70"
                                        style={{ color: 'var(--accent-primary)' }}
                                    >
                                        {allSelected ? 'Deselect All' : 'Select All'}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium rounded-full transition-all hover:opacity-80"
                                            style={{
                                                background: 'transparent',
                                                color: 'rgba(255, 255, 255, 0.95)',
                                                border: '1px solid var(--border-subtle)',
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={onApply}
                                            disabled={noneSelected || applying}
                                            className="px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2"
                                            style={{
                                                background: noneSelected
                                                    ? 'var(--border-subtle)'
                                                    : 'var(--accent-primary)',
                                                color: noneSelected
                                                    ? 'var(--text-muted)'
                                                    : 'var(--text-on-accent)',
                                                opacity: noneSelected ? 0.6 : 1,
                                                cursor: noneSelected ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {applying ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    <span>Applying</span>
                                                </>
                                            ) : (
                                                <span>Apply {selectedTags.size}</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default SmartTagModal;
