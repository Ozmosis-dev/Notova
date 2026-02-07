'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface HeaderProps {
    onImportClick?: () => void;
    onSearch?: (query: string) => void;
    searchValue?: string;
    onMenuClick?: () => void;
    showMenuButton?: boolean;
}

export function Header({
    onImportClick,
    onSearch,
    searchValue = '',
    onMenuClick,
    showMenuButton = false,
}: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState(searchValue);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Sync with external searchValue if provided
    useEffect(() => {
        setSearchQuery(searchValue);
    }, [searchValue]);

    // Debounced search
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch?.(searchQuery);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery, onSearch]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleClear = useCallback(() => {
        setSearchQuery('');
        onSearch?.('');
    }, [onSearch]);

    return (
        <>
            <header
                className="h-16 md:h-18 flex items-center justify-between px-4 md:px-6 shrink-0 z-30 transition-colors"
                style={{
                    background: 'var(--surface-shell)',
                    borderBottom: '1px solid var(--border-subtle)'
                }}
            >
                {/* Left Section - Menu & Logo */}
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Mobile Menu Button */}
                    {showMenuButton && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={onMenuClick}
                            className="p-2 -ml-1 rounded-xl transition-colors md:hidden"
                            aria-label="Open menu"
                        >
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24">
                                <defs>
                                    <linearGradient id="menuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--accent-primary)" />
                                        <stop offset="100%" stopColor="var(--accent-secondary)" />
                                    </linearGradient>
                                </defs>
                                <path stroke="url(#menuGradient)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </motion.button>
                    )}

                    {/* Logo - Editorial Style */}
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <div
                            className="w-6 h-6 md:w-7 md:h-7 items-center justify-center hidden sm:flex"
                        >
                            <svg
                                viewBox="0 0 240 282.3"
                                className="w-full h-full"
                            >
                                <defs>
                                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="var(--accent-primary)" />
                                        <stop offset="100%" stopColor="var(--accent-secondary)" />
                                    </linearGradient>
                                </defs>
                                <g>
                                    <path fill="url(#logoGradient)" d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                                    <path fill="url(#logoGradient)" d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                                </g>
                            </svg>
                        </div>
                        <h1
                            className="text-xl md:text-2xl font-bold hidden sm:block"
                            style={{ color: 'var(--text-on-shell, var(--text-primary))' }}
                        >
                            Notova
                        </h1>
                    </motion.div>
                </div>

                {/* Center - Search */}
                <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-3 md:mx-6">
                    <motion.div
                        className="relative"
                    >
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10"
                            style={{
                                color: isSearchFocused ? 'var(--accent-primary)' : 'var(--text-muted)'
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="w-full pl-11 pr-10 py-2 md:py-3 text-base rounded-2xl transition-all focus:outline-none placeholder:transition-colors"
                            style={{
                                background: 'rgba(128, 128, 128, 0.08)',
                                border: isSearchFocused ? '1px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                                color: 'var(--text-on-shell, var(--text-primary))',
                                outline: 'none'
                            }}
                        />
                        {searchQuery && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-opacity-20 z-10"
                                style={{
                                    background: isSearchFocused
                                        ? 'rgba(255, 255, 255, 0.2)'
                                        : 'var(--border-primary)',
                                    color: isSearchFocused
                                        ? 'rgba(255, 255, 255, 0.9)'
                                        : 'var(--text-muted)'
                                }}
                                aria-label="Clear search"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </motion.button>
                        )}
                    </motion.div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-2.5 md:gap-3">
                    {/* Import Icon Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onImportClick}
                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all shadow-warm-md hover:shadow-warm-lg"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
                        }}
                        aria-label="Import notes"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="var(--text-on-accent)" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                        </svg>
                    </motion.button>
                </div>
            </header>
        </>);
}
