'use client';

import { motion, AnimatePresence } from 'framer-motion';

export type CardColorKey = 'default' | 'black' | 'gold' | 'orange' | 'taupe' | 'olive' | 'blue' | 'purple' | 'red' | 'navy' | 'pink' | null;

interface ColorOption {
    key: CardColorKey;
    label: string;
    cssVar: string;
}

const COLOR_OPTIONS: ColorOption[] = [
    { key: 'default', label: 'Default', cssVar: 'var(--surface-card-default)' },
    { key: 'black', label: 'Black', cssVar: 'var(--surface-card-black)' },
    { key: 'gold', label: 'Gold', cssVar: 'var(--surface-card-gold)' },
    { key: 'orange', label: 'Orange', cssVar: 'var(--surface-card-orange)' },
    { key: 'taupe', label: 'Taupe', cssVar: 'var(--surface-card-taupe)' },
    { key: 'olive', label: 'Olive', cssVar: 'var(--surface-card-olive)' },
    { key: 'blue', label: 'Blue', cssVar: 'var(--surface-card-blue)' },
    { key: 'purple', label: 'Purple', cssVar: 'var(--surface-card-purple)' },
    { key: 'red', label: 'Red', cssVar: 'var(--surface-card-red)' },
    { key: 'navy', label: 'Navy', cssVar: 'var(--surface-card-navy)' },
    { key: 'pink', label: 'Pink', cssVar: 'var(--surface-card-pink)' },
];

interface ColorPickerPopupProps {
    isOpen: boolean;
    currentColor: CardColorKey;
    onColorSelect: (color: CardColorKey) => void;
    onClose: () => void;
}

export function ColorPickerPopup({
    isOpen,
    currentColor,
    onColorSelect,
    onClose,
}: ColorPickerPopupProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close on click outside */}
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    />

                    {/* Color picker popup - centered, 2 rows of 5 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-10 right-0 md:right-0 z-[110] p-3 rounded-xl 
                           bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl
                           border border-white/40 dark:border-white/10
                           shadow-xl shadow-black/10
                           min-w-[180px]"
                        style={{
                            // Auto-position: on mobile, shift left if near right edge
                            transform: 'translateX(min(0px, calc(-100% + 100vw - 20px)))',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="grid grid-cols-5 gap-1.5">
                            {COLOR_OPTIONS.map((option) => (
                                <button
                                    key={option.key ?? 'auto'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onColorSelect(option.key);
                                        onClose();
                                    }}
                                    className={`
                                        w-7 h-7 rounded-lg transition-all duration-150
                                        hover:scale-110 hover:shadow-md
                                        flex items-center justify-center
                                        ${currentColor === option.key
                                            ? 'ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--surface-primary)]'
                                            : 'hover:ring-1 hover:ring-[var(--border-default)]'
                                        }
                                    `}
                                    style={{
                                        backgroundColor: option.key === null
                                            ? 'var(--surface-secondary)'
                                            : option.cssVar,
                                    }}
                                    title={option.label}
                                    aria-label={`Set card color to ${option.label}`}
                                >
                                    {option.key === null && (
                                        <span className="text-[10px] text-[var(--text-secondary)]">A</span>
                                    )}
                                    {currentColor === option.key && option.key !== null && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 rounded-full bg-[var(--text-primary)]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Map color keys to CSS classes for card backgrounds
export function getCardColorStyle(colorKey: CardColorKey | undefined): string {
    if (!colorKey || colorKey === 'default') return 'var(--surface-card-default)';
    const option = COLOR_OPTIONS.find(opt => opt.key === colorKey);
    return option?.cssVar || 'var(--surface-card-default)';
}
