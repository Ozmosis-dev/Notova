'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OpenMoji, OpenMojiButton } from './OpenMoji';
import {
    OPENMOJI_CATEGORIES,
    searchEmojis,
    type CategoryKey,
} from '@/lib/openmoji-categories';
import { useMediaQuery } from '@/hooks/use-media-query';

const RECENT_EMOJIS_KEY = 'emoji-picker-recent';
const MAX_RECENT = 24;

interface EmojiPickerProps {
    onSelect: (hexcode: string) => void;
    onClose: () => void;
    currentEmoji?: string | null;
    className?: string; // Allow custom classes
    style?: React.CSSProperties; // Allow custom styles (e.g. for positioning)
    triggerRef?: React.RefObject<HTMLElement | null>;
}

export function EmojiPicker({ onSelect, onClose, currentEmoji, className = '', style, triggerRef }: EmojiPickerProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('smileys-emotion');
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const pickerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Check for mobile layout (breakpoint matching Tailwind's md: 768px)
    const isMobile = useMediaQuery('(max-width: 768px)');



    // Load recent emojis from localStorage
    useEffect(() => {
        // Use timeout to avoid synchronous state update warning during mount
        const timer = setTimeout(() => {
            try {
                const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
                if (stored) {
                    setRecentEmojis(JSON.parse(stored));
                }
            } catch {
                // Ignore localStorage errors
            }
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Auto-focus is disabled for mobile to prevent keyboard from opening
    useEffect(() => {
        // Check mobile status at runtime using window.matchMedia
        const checkIsMobile = () => window.matchMedia('(max-width: 768px)').matches;

        // Only focus on desktop
        if (!checkIsMobile() && searchRef.current) {
            // Using a small delay to ensure proper mounting
            const timer = setTimeout(() => {
                // Double-check mobile status before focusing
                if (!checkIsMobile()) {
                    searchRef.current?.focus();
                }
            }, 50);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, []); // Empty dependency array - only run on mount

    // Close on outside click
    useEffect(() => {
        // Only attach listener if not mobile (mobile uses overlay click) or if generic behavior is needed
        // but for mobile bottom sheet, clicking the overlay (which is outside) handles it.
        // We still need this for desktop popover mode.
        if (isMobile) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                (!triggerRef?.current || !triggerRef.current.contains(event.target as Node))
            ) {
                onClose();
            }
        };

        if (isMobile) return;

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, isMobile, triggerRef]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Reset scroll position when category changes
    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.scrollTop = 0;
        }
    }, [selectedCategory, search]);

    const handleEmojiSelect = (hexcode: string) => {
        // Update recent emojis
        const newRecent = [hexcode, ...recentEmojis.filter(e => e !== hexcode)].slice(0, MAX_RECENT);
        setRecentEmojis(newRecent);
        try {
            localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(newRecent));
        } catch {
            // Ignore localStorage errors
        }

        onSelect(hexcode);
        onClose();
    };

    const handleRemoveEmoji = () => {
        onSelect('');
        onClose();
    };

    // Get displayed emojis based on search or selected category
    const displayedEmojis = useMemo(() => {
        if (search.trim()) {
            return searchEmojis(search);
        }

        if (selectedCategory === 'recent') {
            return recentEmojis.map(hexcode => ({
                hexcode,
                annotation: '',
                tags: '',
                openmoji_tags: '',
                group: 'recent',
                subgroups: '',
            }));
        }

        return OPENMOJI_CATEGORIES[selectedCategory]?.emojis || [];
    }, [search, selectedCategory, recentEmojis]);

    // Category keys for tabs
    const categoryKeys = useMemo(() => {
        const keys: CategoryKey[] = [];
        if (recentEmojis.length > 0) {
            keys.push('recent');
        }
        const mainCategories: CategoryKey[] = [
            'smileys-emotion',
            'people-body',
            'animals-nature',
            'food-drink',
            'travel-places',
            'activities',
            'objects',
            'symbols',
            'flags',
            'extras-openmoji',
        ];
        keys.push(...mainCategories);
        return keys;
    }, [recentEmojis.length]);

    // Animation variants
    const variants = isMobile ? {
        initial: { y: '100%', opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 1 }
    } : {
        initial: { opacity: 0, scale: 0.95, y: -10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -10 }
    };

    return (
        <>
            {/* Mobile Overlay Backdrop - Warm tint */}
            {isMobile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={onClose}
                />
            )}

            <motion.div
                ref={pickerRef}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
                className={`
                    flex flex-col overflow-hidden shadow-2xl
                    bg-[#FFFDF8]/98 dark:bg-[#1A1A1A]/98 backdrop-blur-xl
                    border border-[var(--border-primary)] dark:border-[var(--border-subtle)]
                    ${isMobile
                        ? 'fixed inset-x-0 bottom-0 z-100 rounded-t-3xl h-[60vh] max-h-[600px] w-full'
                        : 'absolute z-50 w-[400px] rounded-2xl h-[480px]'
                    } ${className}
                `}
                style={style}
            >
                {/* Mobile drag handle - Warm tint */}
                {isMobile && (
                    <div className="w-full flex justify-center pt-3 pb-1 shrink-0" onClick={onClose}>
                        <div className="w-12 h-1.5 bg-[#D4A574]/40 dark:bg-[#8B7355]/40 rounded-full" />
                    </div>
                )}

                {/* Header Section */}
                <div className="p-4 pb-2 shrink-0">
                    <div className="relative group">
                        <svg
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10"
                            style={{
                                color: search ? '#FF8C00' : 'var(--text-muted)'
                            }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search emojis..."
                            className="w-full pl-11 pr-10 py-2.5 md:py-3 text-base rounded-2xl transition-all focus:outline-none placeholder:transition-colors"
                            style={{
                                background: 'rgba(128, 128, 128, 0.08)',
                                border: search ? '1px solid #FFA500' : '1px solid var(--border-primary)',
                                color: 'var(--text-on-shell, var(--text-primary))',
                                outline: 'none'
                            }}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-opacity-20 z-10"
                                style={{
                                    background: search
                                        ? 'rgba(255, 255, 255, 0.2)'
                                        : 'var(--border-primary)',
                                    color: search
                                        ? 'rgba(255, 255, 255, 0.9)'
                                        : 'var(--text-muted)'
                                }}
                                aria-label="Clear search"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Category tabs */}
                {!search && (
                    <div className="relative shrink-0 border-b border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar px-3 pb-2 snap-x">
                            {categoryKeys.map((key) => {
                                const category = OPENMOJI_CATEGORIES[key];
                                const isSelected = selectedCategory === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className={`
                                            relative shrink-0 p-2 rounded-xl transition-all duration-200 snap-start
                                            flex items-center justify-center
                                            ${isSelected
                                                ? 'bg-[var(--highlight-soft)] text-[var(--highlight)] dark:bg-[rgba(242,212,102,0.15)] dark:text-[var(--highlight)]'
                                                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                            }
                                        `}
                                        title={category.label}
                                    >
                                        <OpenMoji hexcode={category.iconHexcode} size={20} className={isSelected ? 'opacity-100' : 'opacity-70'} />
                                        {isSelected && (
                                            <motion.div
                                                layoutId="activeCategory"
                                                className="absolute inset-x-1 -bottom-[9px] h-0.5 bg-[var(--highlight)] rounded-t-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Gradient Fade for scroll indicators */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white dark:from-black to-transparent pointer-events-none opacity-50" />
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-white dark:from-black to-transparent pointer-events-none opacity-50" />
                    </div>
                )}

                {/* Main Content Area - Category Label & Grid */}
                <div className="flex-1 min-h-0 bg-[var(--surface-content)] dark:bg-[#1A1A1A] flex flex-col relative">
                    {/* Sticky Label */}
                    <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex justify-between items-center bg-[#FFFDF8]/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-sm">
                        <span>
                            {search ? (
                                `Results`
                            ) : (
                                OPENMOJI_CATEGORIES[selectedCategory]?.label
                            )}
                        </span>
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                            {displayedEmojis.length}
                        </span>
                    </div>

                    {/* Emoji grid */}
                    <div
                        ref={gridRef}
                        className="flex-1 overflow-y-auto p-2 sm:p-4 custom-scrollbar"
                    >
                        {displayedEmojis.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3">
                                    <OpenMoji hexcode="1F50D" size={32} className="opacity-50" />
                                </div>
                                <span className="text-sm font-medium">No results found</span>
                            </div>
                        ) : (
                            <div className={`grid ${isMobile ? 'grid-cols-6 gap-3' : 'grid-cols-8 gap-1'} pb-4`}>
                                {displayedEmojis.map((emoji, index) => (
                                    <OpenMojiButton
                                        key={`${emoji.hexcode}-${index}`}
                                        hexcode={emoji.hexcode}
                                        size={isMobile ? 32 : 28}
                                        className={`${isMobile ? 'w-full aspect-square flex items-center justify-center p-0' : ''}`}
                                        onClick={() => handleEmojiSelect(emoji.hexcode)}
                                        selected={currentEmoji === emoji.hexcode}
                                        title={emoji.annotation}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {currentEmoji && (
                    <div className={`px-4 py-3 border-t border-[var(--border-primary)] dark:border-[var(--border-subtle)] bg-[#FFFDF8]/98 dark:bg-[#1A1A1A]/98 backdrop-blur-md flex items-center justify-end shrink-0 ${isMobile ? 'pb-8' : ''}`}>
                        <button
                            onClick={handleRemoveEmoji}
                            className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all hover:opacity-90"
                            style={{
                                color: '#ef4444', // Brighter red text for better readability
                                background: 'rgba(239, 68, 68, 0.15)', // More visible background
                            }}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--status-error)' }}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--status-error)' }}></span>
                            </span>
                            Remove Icon
                        </button>
                    </div>
                )}
            </motion.div>
        </>
    );
}


// Icon display component for consistency
interface IconDisplayProps {
    /** OpenMoji hexcode (e.g., "1F600") */
    icon?: string | null;
    fallback?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function IconDisplay({ icon, fallback, size = 'md', className = '' }: IconDisplayProps) {
    const sizeMap = {
        sm: 16,
        md: 20,
        lg: 28,
    };

    const pixelSize = sizeMap[size];

    if (icon) {
        return (
            <span className={`inline-flex items-center justify-center ${className}`}>
                <OpenMoji hexcode={icon} size={pixelSize} />
            </span>
        );
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return null;
}

// Inline icon button that opens the emoji picker
interface IconButtonProps {
    /** OpenMoji hexcode (e.g., "1F600") */
    icon?: string | null;
    onIconChange: (hexcode: string) => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    placeholder?: React.ReactNode;
}

export function IconButton({ icon, onIconChange, size = 'md', className = '', placeholder }: IconButtonProps) {
    const [showPicker, setShowPicker] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const togglePicker = () => {
        if (!showPicker && buttonRef.current && !isMobile) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Default: position to the right
            let left = rect.right + 12;
            let top = rect.top;

            // Check if it fits on the right (400px width)
            if (left + 400 > window.innerWidth) {
                // Try left side
                left = rect.left - 412;
            }

            // Check vertical space (480px height)
            if (top + 480 > window.innerHeight) {
                top = Math.max(10, window.innerHeight - 490);
            }

            setPosition({ top, left });
        }
        setShowPicker(!showPicker);
    };

    const sizeClasses = {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-12 h-12',
    };

    const iconSizeMap = {
        sm: 16,
        md: 22,
        lg: 28,
    };

    const defaultPlaceholder = (
        <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className="relative">
            <motion.button
                ref={buttonRef}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePicker}
                className={`flex items-center justify-center rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-transparent dark:hover:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-600 transition-all ${sizeClasses[size]} ${className}`}
                title={icon ? 'Change icon' : 'Add icon'}
            >
                {icon ? (
                    <OpenMoji hexcode={icon} size={iconSizeMap[size]} />
                ) : (
                    placeholder || defaultPlaceholder
                )}
            </motion.button>

            {mounted && createPortal(
                <AnimatePresence>
                    {showPicker && (
                        <div className="fixed inset-0 z-[9999] pointer-events-none">
                            <div className="pointer-events-auto">
                                <EmojiPicker
                                    onSelect={(hex) => {
                                        onIconChange(hex);
                                    }}
                                    onClose={() => setShowPicker(false)}
                                    currentEmoji={icon}
                                    className={!isMobile ? "fixed shadow-2xl" : undefined}
                                    style={!isMobile && position ? { top: position.top, left: position.left, position: 'fixed' } : undefined}
                                    triggerRef={buttonRef}
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
