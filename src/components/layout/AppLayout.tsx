'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface Notebook {
    id: string;
    name: string;
    icon?: string | null;
    noteCount: number;
    isDefault?: boolean;
    isPinned?: boolean;
}

interface Tag {
    id: string;
    name: string;
    noteCount: number;
}

interface Stack {
    id: string;
    name: string;
    icon?: string | null;
    userId?: string;
}

interface AppLayoutProps {
    children: ReactNode;
    // Sidebar props
    notebooks?: Notebook[];
    tags?: Tag[];
    selectedNotebookId?: string | null;
    selectedTagId?: string | null;
    onNotebookSelect?: (id: string | null) => void;
    onTagSelect?: (id: string | null) => void;
    onNewNotebook?: (stackId?: string) => void;
    onNotebookIconChange?: (id: string, icon: string | null) => void;
    onNotebookPinToggle?: (id: string) => void;
    onNotebooksViewToggle?: () => void;
    onAllNotesClick?: () => void;
    onTagDelete?: (tagId: string) => Promise<void>;
    onTrashClick?: () => void;
    trashCount?: number;
    showNotebooksView?: boolean;
    // Header props
    onImportClick?: () => void;
    onSearch?: (query: string) => void;
    // Stack props
    stacks?: Stack[];
    onStackCreate?: (name: string) => Promise<void>;
    onStackUpdate?: (id: string, updates: { name?: string; icon?: string | null }) => Promise<void>;
    onStackDelete?: (id: string) => Promise<void>;
    onNotebookMove?: (notebookId: string, stackId: string | null) => Promise<void>;
    selectedStackId?: string | null;
    onStackSelect?: (id: string | null) => void;
}

export function AppLayout({
    children,
    notebooks = [],
    tags = [],
    selectedNotebookId,
    selectedTagId,
    onNotebookSelect,
    onTagSelect,
    onNewNotebook,
    onNotebookIconChange,
    onNotebookPinToggle,
    onNotebooksViewToggle,
    onAllNotesClick,
    onTagDelete,
    onTrashClick,
    trashCount,
    showNotebooksView = false,
    onImportClick,
    onSearch,
    stacks = [],
    onStackCreate,
    onStackUpdate,
    onStackDelete,
    onNotebookMove,
    selectedStackId,
    onStackSelect,
}: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar when selection changes on mobile
    const handleSidebarItemClick = useCallback(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen, isMobile]);

    return (
        <div
            className="h-screen flex flex-col overflow-hidden transition-colors"
            style={{ background: 'var(--surface-shell)' }}
        >
            {/* Header with mobile menu toggle */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    showMenuButton={isMobile}
                    onImportClick={onImportClick}
                    onSearch={onSearch}
                />
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative min-w-0">
                {/* Mobile Overlay — CSS-driven for performance */}
                {isMobile && (
                    <div
                        className="mobile-overlay"
                        onClick={closeSidebar}
                        style={{
                            opacity: sidebarOpen ? 1 : 0,
                            pointerEvents: sidebarOpen ? 'auto' : 'none',
                            transition: 'opacity 0.2s ease',
                        }}
                    />
                )}

                {/* Sidebar — CSS transform for GPU-accelerated slide */}
                <aside
                    className={`
                        ${isMobile
                            ? 'fixed inset-y-0 left-0 z-50 w-72 pt-0'
                            : 'relative w-64 shrink-0'
                        }
                    `}
                    style={{
                        background: 'var(--surface-shell)',
                        borderRight: '1px solid var(--border-subtle)',
                        ...(isMobile ? {
                            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                            visibility: sidebarOpen ? 'visible' as const : 'hidden' as const,
                            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.25s',
                            willChange: 'transform',
                        } : {}),
                    }}
                >
                    {/* Mobile sidebar header */}
                    {isMobile && (
                        <div
                            className="h-14 flex items-center justify-between px-4"
                            style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 flex items-center justify-center">
                                    <svg
                                        viewBox="0 0 240 282.3"
                                        className="w-full h-full"
                                    >
                                        <defs>
                                            <linearGradient id="mobileSidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="var(--accent-primary)" />
                                                <stop offset="100%" stopColor="var(--accent-secondary)" />
                                            </linearGradient>
                                        </defs>
                                        <g>
                                            <path fill="url(#mobileSidebarLogoGradient)" d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                                            <path fill="url(#mobileSidebarLogoGradient)" d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                                        </g>
                                    </svg>
                                </div>
                                <span
                                    className="font-bold text-lg"
                                    style={{ color: 'var(--text-on-shell)' }}
                                >
                                    Notova
                                </span>
                            </div>
                            <button
                                onClick={closeSidebar}
                                className="p-2 rounded-xl transition-colors"
                                style={{ color: 'var(--text-on-shell-secondary, var(--text-secondary))' }}
                                aria-label="Close sidebar"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <Sidebar
                        notebooks={notebooks}
                        tags={tags}
                        selectedNotebookId={selectedNotebookId}
                        selectedTagId={selectedTagId}
                        onNotebookSelect={(id: string | null) => {
                            onNotebookSelect?.(id);
                            handleSidebarItemClick();
                        }}
                        onTagSelect={(id: string | null) => {
                            onTagSelect?.(id);
                            handleSidebarItemClick();
                        }}
                        stacks={stacks}
                        onStackCreate={onStackCreate}
                        onStackUpdate={onStackUpdate}
                        onStackDelete={onStackDelete}
                        onNotebookMove={onNotebookMove}
                        selectedStackId={selectedStackId}
                        onStackSelect={onStackSelect}
                        onNewNotebook={onNewNotebook}
                        onNotebookIconChange={onNotebookIconChange}
                        onNotebookPinToggle={onNotebookPinToggle}
                        onNotebooksViewToggle={onNotebooksViewToggle}
                        onAllNotesClick={() => {
                            onAllNotesClick?.();
                            handleSidebarItemClick();
                        }}
                        onItemClick={handleSidebarItemClick}
                        onTagDelete={onTagDelete}
                        onTrashClick={onTrashClick}
                        trashCount={trashCount}
                        showNotebooksView={showNotebooksView}
                    />
                </aside>

                {/* Content Area - Warm content surface */}
                <motion.main
                    className="flex-1 flex overflow-hidden transition-colors min-w-0"
                    style={{ background: 'var(--surface-content)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}
