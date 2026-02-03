'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '../ui/EmojiPicker';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';
import { ReportIssueModal } from '@/components/ui/ReportIssueModal';
import { AddToHomeScreenModal } from '@/components/ui/AddToHomeScreenModal';

interface Notebook {
    id: string;
    name: string;
    icon?: string | null;
    noteCount: number;
    isDefault?: boolean;
}

interface Tag {
    id: string;
    name: string;
    color?: string | null;
    noteCount: number;
}

interface SidebarProps {
    notebooks?: Notebook[];
    tags?: Tag[];
    selectedNotebookId?: string | null;
    selectedTagId?: string | null;
    onNotebookSelect?: (id: string | null) => void;
    onTagSelect?: (id: string | null) => void;
    onNotebookIconChange?: (id: string, icon: string) => void;
    onNewNotebook?: () => void;
    onItemClick?: () => void; // For closing mobile sidebar
    onNotebooksViewToggle?: () => void; // For showing notebooks grid view
    onAllNotesClick?: () => void; // For navigating to all notes view
    onTagDelete?: (id: string) => Promise<void>; // For deleting tags
    onTrashClick?: () => void; // For navigating to trash view
    trashCount?: number; // Number of items in trash
    showNotebooksView?: boolean; // Whether the notebooks grid view is showing
}

const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.03,
            duration: 0.2,
        },
    }),
};

export function Sidebar({
    notebooks = [],
    tags = [],
    selectedNotebookId,
    selectedTagId,
    onNotebookSelect,
    onTagSelect,
    onNotebookIconChange,
    onNewNotebook,
    onItemClick,
    onNotebooksViewToggle,
    onAllNotesClick,
    onTagDelete,
    onTrashClick,
    trashCount = 0,
    showNotebooksView = false,
}: SidebarProps) {
    const [notebooksExpanded, setNotebooksExpanded] = useState(true);
    const [tagsExpanded, setTagsExpanded] = useState(true);
    const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
    const [isAddToHomeScreenModalOpen, setIsAddToHomeScreenModalOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const { user, loading, signOut } = useAuth();

    // Close profile menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        }
        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileMenuOpen]);

    const handleSignOut = async () => {
        setIsProfileMenuOpen(false);
        await signOut();
    };

    const handleReportIssue = () => {
        setIsProfileMenuOpen(false);
        setIsReportIssueModalOpen(true);
    };

    // Sort tags alphabetically A-Z
    const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

    const handleNotebookClick = (id: string | null) => {
        onNotebookSelect?.(id);
        onItemClick?.();
    };

    const handleTagClick = (id: string | null) => {
        onTagSelect?.(id);
        onItemClick?.();
    };

    const handleConfirmDelete = async () => {
        if (!tagToDelete || !onTagDelete) return;

        setIsDeleting(true);
        try {
            await onTagDelete(tagToDelete.id);
            setTagToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <aside
                className="h-full flex flex-col transition-colors"
                style={{ background: 'var(--surface-shell)' }}
            >
                {/* All Notes */}
                <div className="p-3 md:p-4">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            onAllNotesClick?.();
                            onItemClick?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                            background: !selectedNotebookId && !selectedTagId && !showNotebooksView
                                ? 'var(--sidebar-selection-bg)'
                                : 'transparent',
                            backdropFilter: !selectedNotebookId && !selectedTagId && !showNotebooksView
                                ? 'blur(12px) saturate(180%)'
                                : 'none',
                            WebkitBackdropFilter: !selectedNotebookId && !selectedTagId && !showNotebooksView
                                ? 'blur(12px) saturate(180%)'
                                : 'none',
                            border: !selectedNotebookId && !selectedTagId && !showNotebooksView
                                ? '1px solid var(--sidebar-selection-border)'
                                : '1px solid transparent',
                            boxShadow: !selectedNotebookId && !selectedTagId && !showNotebooksView
                                ? '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                : 'none',
                            color: !selectedNotebookId && !selectedTagId && !showNotebooksView
                                ? 'var(--text-on-shell, var(--text-primary))'
                                : 'var(--text-on-shell-secondary, var(--text-secondary))'
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{
                                background: !selectedNotebookId && !selectedTagId && !showNotebooksView
                                    ? 'var(--sidebar-selection-icon)'
                                    : 'var(--surface-shell-hover)'
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        All Notes
                    </motion.button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-3 md:px-4 hide-scrollbar">
                    {/* Notebooks Section */}
                    <div className="mb-4">
                        <button
                            onClick={() => {
                                setNotebooksExpanded(!notebooksExpanded);
                                onNotebooksViewToggle?.();
                                onItemClick?.();
                            }}
                            className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Notebooks
                            </span>
                            <motion.svg
                                animate={{ rotate: notebooksExpanded ? 0 : -90 }}
                                transition={{ duration: 0.2 }}
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </button>

                        <AnimatePresence>
                            {notebooksExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-1 overflow-hidden"
                                >
                                    {notebooks.map((notebook, index) => (
                                        <motion.div
                                            key={notebook.id}
                                            custom={index}
                                            variants={listItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover={{ x: 2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleNotebookClick(notebook.id)}
                                            role="button"
                                            tabIndex={0}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer"
                                            style={{
                                                background: selectedNotebookId === notebook.id
                                                    ? 'var(--sidebar-selection-bg)'
                                                    : 'transparent',
                                                backdropFilter: selectedNotebookId === notebook.id
                                                    ? 'blur(12px) saturate(180%)'
                                                    : 'none',
                                                WebkitBackdropFilter: selectedNotebookId === notebook.id
                                                    ? 'blur(12px) saturate(180%)'
                                                    : 'none',
                                                border: selectedNotebookId === notebook.id
                                                    ? '1px solid var(--sidebar-selection-border)'
                                                    : '1px solid transparent',
                                                boxShadow: selectedNotebookId === notebook.id
                                                    ? '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                                    : 'none',
                                                color: selectedNotebookId === notebook.id
                                                    ? 'var(--text-on-shell, var(--text-primary))'
                                                    : 'var(--text-on-shell-secondary, var(--text-secondary))'
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <IconButton
                                                        icon={notebook.icon}
                                                        onIconChange={(icon) => onNotebookIconChange?.(notebook.id, icon)}
                                                        size="sm"
                                                        placeholder={
                                                            <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                        }
                                                    />
                                                </div>
                                                <span className="truncate">{notebook.name}</span>
                                                {notebook.isDefault && (
                                                    <span
                                                        className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                                                        style={{
                                                            background: 'var(--border-primary)',
                                                            color: 'var(--text-muted)'
                                                        }}
                                                    >
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className="text-xs tabular-nums"
                                                style={{ color: 'var(--text-muted)' }}
                                            >
                                                {notebook.noteCount}
                                            </span>
                                        </motion.div>
                                    ))}

                                    {/* New Notebook Button */}
                                    <motion.button
                                        whileHover={{ x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onNewNotebook}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
                                        style={{ color: 'var(--accent-primary)' }}
                                    >
                                        <div
                                            className="w-4 h-4 rounded border-2 border-dashed border-current flex items-center justify-center"
                                        >
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                        New Notebook
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Tags Section */}
                    <div className="mb-4">
                        <button
                            onClick={() => setTagsExpanded(!tagsExpanded)}
                            className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Tags
                            </span>
                            <motion.svg
                                animate={{ rotate: tagsExpanded ? 0 : -90 }}
                                transition={{ duration: 0.2 }}
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </motion.svg>
                        </button>

                        <AnimatePresence>
                            {tagsExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-1 overflow-hidden"
                                >
                                    {sortedTags.length > 0 ? (
                                        sortedTags.map((tag, index) => (
                                            <motion.div
                                                key={tag.id}
                                                custom={index}
                                                variants={listItemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                whileHover={{ x: 2 }}
                                                className="group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer"
                                                style={{
                                                    background: selectedTagId === tag.id
                                                        ? 'var(--sidebar-selection-bg)'
                                                        : 'transparent',
                                                    backdropFilter: selectedTagId === tag.id
                                                        ? 'blur(12px) saturate(180%)'
                                                        : 'none',
                                                    WebkitBackdropFilter: selectedTagId === tag.id
                                                        ? 'blur(12px) saturate(180%)'
                                                        : 'none',
                                                    border: selectedTagId === tag.id
                                                        ? '1px solid var(--sidebar-selection-border)'
                                                        : '1px solid transparent',
                                                    boxShadow: selectedTagId === tag.id
                                                        ? '0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                                        : 'none',
                                                    color: selectedTagId === tag.id
                                                        ? 'var(--text-on-shell, var(--text-primary))'
                                                        : 'var(--text-on-shell-secondary, var(--text-secondary))'
                                                }}
                                                onClick={() => handleTagClick(tag.id)}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <span
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ background: 'var(--accent-primary)' }}
                                                    />
                                                    <span className="truncate">{tag.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span
                                                        className="text-xs tabular-nums"
                                                        style={{ color: 'var(--text-muted)' }}
                                                    >
                                                        {tag.noteCount}
                                                    </span>
                                                    {onTagDelete && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTagToDelete(tag);
                                                            }}
                                                            className="p-1 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 max-md:opacity-60"
                                                            style={{
                                                                color: 'var(--text-muted)',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = 'var(--surface-shell-hover)';
                                                                e.currentTarget.style.color = 'var(--warning-color, #ef4444)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'transparent';
                                                                e.currentTarget.style.color = 'var(--text-muted)';
                                                            }}
                                                            aria-label={`Delete tag ${tag.name}`}
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p
                                            className="px-3 py-2 text-sm italic"
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            No tags yet
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Add to Home Screen Button */}
                <div className="px-3 md:px-4 pb-2">
                    <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setIsAddToHomeScreenModalOpen(true);
                            // onItemClick?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                        style={{ color: 'var(--accent-primary)' }}
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--surface-shell-hover)' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="flex-1 text-left">Add to Home Screen</span>
                    </motion.button>
                </div>

                {/* Bottom - Profile & Trash */}
                <div
                    className="p-3 md:p-4 space-y-2"
                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                >

                    {/* User Profile Menu */}
                    {!loading && user && (
                        <div
                            ref={profileMenuRef}
                            className="relative mb-2"
                        >
                            {/* User profile button */}
                            <motion.button
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                                style={{ color: 'var(--text-on-shell-secondary, var(--text-secondary))' }}
                                aria-label="User profile menu"
                                aria-expanded={isProfileMenuOpen}
                                aria-haspopup="true"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--surface-shell-hover)' }}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span className="flex-1 text-left truncate">{user.email}</span>
                                <motion.svg
                                    animate={{ rotate: isProfileMenuOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-4 h-4 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                            </motion.button>

                            {/* Profile Dropdown Menu */}
                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 bottom-full mb-2 w-full rounded-xl overflow-hidden z-50"
                                        style={{
                                            background: 'var(--surface-shell)',
                                            border: '1px solid var(--border-primary)',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05)',
                                        }}
                                    >
                                        {/* User email display */}
                                        <div
                                            className="px-4 py-3 border-b"
                                            style={{ borderColor: 'var(--border-subtle)' }}
                                        >
                                            <p
                                                className="text-xs font-medium truncate"
                                                style={{ color: 'var(--text-on-shell-secondary, var(--text-muted))' }}
                                            >
                                                Signed in as
                                            </p>
                                            <p
                                                className="text-sm font-semibold truncate mt-0.5"
                                                style={{ color: 'var(--text-on-shell, var(--text-primary))' }}
                                            >
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* Menu items */}
                                        <div className="py-1.5">
                                            <button
                                                onClick={handleReportIssue}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                                style={{ color: 'var(--text-on-shell, var(--text-primary))' }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-on-shell-secondary, var(--text-muted))' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm">Report an issue</span>
                                            </button>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                                style={{ color: 'var(--text-on-shell, var(--text-primary))' }}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-on-shell-secondary, var(--text-muted))' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span className="text-sm font-medium">Sign out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Trash Button */}
                    <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            onTrashClick?.();
                            onItemClick?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                        style={{ color: 'var(--text-on-shell-secondary, var(--text-secondary))' }}
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--surface-shell-hover)' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <span className="flex-1 text-left">Trash</span>
                        {trashCount > 0 && (
                            <span
                                className="px-1.5 py-0.5 text-xs font-medium rounded-md"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: 'rgb(239, 68, 68)'
                                }}
                            >
                                {trashCount}
                            </span>
                        )}
                    </motion.button>
                </div>
            </aside>

            {/* Delete Tag Confirmation Modal */}
            <Modal
                isOpen={!!tagToDelete}
                onClose={() => setTagToDelete(null)}
                title="Delete Tag"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Are you sure you want to delete the tag <strong style={{ color: 'var(--text-primary)' }}>"{tagToDelete?.name}"</strong>?
                        This will remove the tag from all notes but won't delete the notes themselves.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="secondary"
                            onClick={() => setTagToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            style={{ background: 'var(--warning-color, #ef4444)' }}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Tag'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Report Issue Modal */}
            <ReportIssueModal
                isOpen={isReportIssueModalOpen}
                onClose={() => setIsReportIssueModalOpen(false)}
                userEmail={user?.email || undefined}
                userId={user?.id || undefined}
            />

            {/* Add to Home Screen Modal */}
            <AddToHomeScreenModal
                isOpen={isAddToHomeScreenModalOpen}
                onClose={() => setIsAddToHomeScreenModalOpen(false)}
            />
        </>
    );
}
