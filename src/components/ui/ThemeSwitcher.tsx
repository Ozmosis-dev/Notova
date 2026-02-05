'use client';

import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { THEMES, THEME_KEYS, ThemeKey } from '@/lib/themes';
import { useAuth } from '@/components/providers/AuthProvider';

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const { updateTheme } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredTheme, setHoveredTheme] = useState<ThemeKey | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState({ bottom: 0, left: 0, width: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside (check both button and dropdown)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const clickedButton = buttonRef.current?.contains(target);
            const clickedDropdown = dropdownRef.current?.contains(target);
            if (!clickedButton && !clickedDropdown) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate dropdown position when opened
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                // Position the bottom of dropdown 8px above the button's top
                bottom: window.innerHeight - rect.top + 8,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen]);

    const handleThemeChange = async (newTheme: ThemeKey) => {
        setTheme(newTheme);
        await updateTheme(newTheme);
        setIsOpen(false);
    };

    if (!mounted) {
        return (
            <div className="px-3 py-2.5">
                <div className="flex items-center gap-3 opacity-50">
                    <div className="w-5 h-5 rounded-md bg-current opacity-20" />
                    <span className="text-sm">Theme</span>
                </div>
            </div>
        );
    }

    const currentTheme = THEMES[theme as ThemeKey] || THEMES.dark;
    const CurrentIcon = currentTheme.icon;

    return (
        <div className="relative">
            <motion.button
                ref={buttonRef}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: 'var(--text-on-shell-secondary, var(--text-secondary))' }}
            >
                <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--surface-shell-hover)' }}
                >
                    <CurrentIcon size={14} />
                </div>
                <span className="text-sm flex-1 text-left">Theme</span>
                <span
                    className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{ background: 'var(--surface-shell-hover)', color: 'var(--accent-primary)' }}
                >
                    {currentTheme.name}
                </span>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </motion.button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="fixed p-2 rounded-xl shadow-lg max-h-[400px] overflow-y-auto"
                            style={{
                                bottom: dropdownPosition.bottom,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                                zIndex: 9999,
                                background: 'var(--surface-shell)',
                                border: '1px solid var(--border-primary)'
                            }}
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {THEME_KEYS.map((themeKey) => {
                                    const themeData = THEMES[themeKey];
                                    const isSelected = theme === themeKey;
                                    const ThemeIcon = themeData.icon;

                                    return (
                                        <button
                                            key={themeKey}
                                            onClick={() => handleThemeChange(themeKey)}
                                            onMouseEnter={() => setHoveredTheme(themeKey)}
                                            onMouseLeave={() => setHoveredTheme(null)}
                                            className={`
                                            relative p-2.5 rounded-lg transition-all duration-200
                                            ${isSelected
                                                    ? 'ring-2 ring-[var(--accent-primary)] ring-offset-1 ring-offset-[var(--surface-shell)]'
                                                    : 'hover:scale-[1.02]'}
                                        `}
                                            style={{
                                                background: 'var(--surface-shell-hover)'
                                            }}
                                        >
                                            {/* Theme Preview */}
                                            <div
                                                className="h-8 rounded-md mb-2 flex items-center overflow-hidden"
                                                style={{ border: '1px solid var(--border-subtle)' }}
                                            >
                                                {/* Shell preview */}
                                                <div
                                                    className="w-1/3 h-full"
                                                    style={{ background: themeData.preview.shell }}
                                                />
                                                {/* Content preview */}
                                                <div
                                                    className="w-2/3 h-full relative"
                                                    style={{ background: themeData.preview.content }}
                                                >
                                                    {/* Accent dot */}
                                                    <div
                                                        className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
                                                        style={{ background: themeData.preview.accent }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Theme Info */}
                                            <div className="flex items-center gap-1.5">
                                                <ThemeIcon size={14} style={{ color: 'var(--text-on-shell)' }} />
                                                <span
                                                    className="text-xs font-medium"
                                                    style={{ color: 'var(--text-on-shell)' }}
                                                >
                                                    {themeData.name}
                                                </span>
                                                {isSelected && (
                                                    <motion.svg
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-3 h-3 ml-auto"
                                                        style={{ color: 'var(--accent-primary)' }}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </motion.svg>
                                                )}
                                            </div>

                                            {/* Description - Show on hover */}
                                            <AnimatePresence>
                                                {hoveredTheme === themeKey && (
                                                    <motion.p
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="text-[10px] mt-0.5 text-left overflow-hidden"
                                                        style={{ color: 'var(--text-on-shell-secondary)' }}
                                                    >
                                                        {themeData.description}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
