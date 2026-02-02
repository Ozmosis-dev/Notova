'use client';

import { useState, useEffect } from 'react';

/**
 * Converts a native emoji character to its hexcode representation.
 * E.g., "📝" becomes "1F4DD"
 */
function emojiToHexcode(emoji: string): string {
    if (!emoji) return '';

    const codepoints: string[] = [];

    // Handle emoji sequences (ZWJ, skin tones, etc.)
    for (const char of emoji) {
        const codepoint = char.codePointAt(0);
        if (codepoint !== undefined) {
            codepoints.push(codepoint.toString(16).toUpperCase());
        }
    }

    return codepoints.join('-');
}

/**
 * Checks if a string is a native emoji character (not a hexcode).
 * Hexcodes are alphanumeric strings like "1F600" or "1F468-200D-1F4BB".
 * Native emojis are actual Unicode characters.
 */
function isNativeEmoji(input: string): boolean {
    if (!input) return false;

    // Hexcodes are alphanumeric with optional hyphens (e.g., "1F600", "1F468-200D-1F4BB")
    const hexcodePattern = /^[0-9A-Fa-f]+(-[0-9A-Fa-f]+)*$/;
    if (hexcodePattern.test(input)) {
        return false; // It's already a hexcode
    }

    // Check if the first character is in emoji ranges
    const firstCodepoint = input.codePointAt(0);
    if (!firstCodepoint) return false;

    // Common emoji ranges
    return (
        (firstCodepoint >= 0x1F000 && firstCodepoint <= 0x1FFFF) || // Miscellaneous Symbols and Pictographs
        (firstCodepoint >= 0x2600 && firstCodepoint <= 0x27BF) ||   // Miscellaneous Symbols
        (firstCodepoint >= 0x2300 && firstCodepoint <= 0x23FF) ||   // Miscellaneous Technical
        (firstCodepoint >= 0x2190 && firstCodepoint <= 0x21FF) ||   // Arrows
        (firstCodepoint >= 0xFE00 && firstCodepoint <= 0xFE0F) ||   // Variation Selectors
        (firstCodepoint >= 0x1F1E0 && firstCodepoint <= 0x1F1FF)    // Regional Indicators (flags)
    );
}

interface OpenMojiProps {
    /** The OpenMoji hexcode to display (e.g., "1F600" for grinning face) */
    hexcode: string;
    /** Size of the emoji in pixels (default: 24) */
    size?: number;
    /** Additional CSS classes */
    className?: string;
    /** Alt text for accessibility */
    alt?: string;
}

/**
 * OpenMoji Component
 * 
 * Displays an OpenMoji SVG using its hexcode for consistent cross-platform appearance.
 * Also supports legacy native emoji characters by converting them to hexcodes.
 */
export function OpenMoji({
    hexcode: inputValue,
    size = 24,
    className = '',
    alt,
}: OpenMojiProps) {
    const [loadError, setLoadError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState<string | null>(null);

    // Normalize input: convert native emoji to hexcode if needed
    const hexcode = isNativeEmoji(inputValue) ? emojiToHexcode(inputValue) : inputValue;

    useEffect(() => {
        if (!hexcode) {
            setCurrentSrc(null);
            return;
        }
        setCurrentSrc(`/openmoji/${hexcode}.svg`);
        setLoadError(false);
    }, [hexcode]);

    const handleError = () => {
        // Try without FE0F variation selector
        if (hexcode.includes('-FE0F') && currentSrc?.includes('-FE0F')) {
            const fallback = `/openmoji/${hexcode.replace(/-FE0F/g, '')}.svg`;
            setCurrentSrc(fallback);
        } else {
            setLoadError(true);
        }
    };

    // If no hexcode or load failed, render a placeholder
    if (!hexcode || loadError) {
        return (
            <span
                className={`inline-flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded ${className}`}
                style={{ width: size, height: size }}
                role="img"
                aria-label={alt || 'emoji'}
            >
                <span className="text-zinc-400" style={{ fontSize: size * 0.5 }}>?</span>
            </span>
        );
    }

    // Render the OpenMoji SVG
    return (
        <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
            role="img"
            aria-label={alt || 'emoji'}
        >
            {currentSrc && (
                <img
                    src={currentSrc}
                    alt={alt || 'emoji'}
                    width={size}
                    height={size}
                    onError={handleError}
                    style={{
                        width: size,
                        height: size,
                        objectFit: 'contain',
                    }}
                    loading="lazy"
                    decoding="async"
                />
            )}
        </span>
    );
}

/**
 * OpenMojiButton Component
 * 
 * A clickable OpenMoji emoji, typically used in emoji pickers.
 */
interface OpenMojiButtonProps {
    hexcode: string;
    size?: number;
    className?: string;
    onClick?: () => void;
    selected?: boolean;
    title?: string;
}

export function OpenMojiButton({
    hexcode,
    size = 28,
    className = '',
    onClick,
    selected = false,
    title,
}: OpenMojiButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`
                p-1.5 rounded-lg transition-all duration-150 ease-out
                hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-110
                active:scale-95
                ${selected ? 'bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-600' : ''}
                ${className}
            `}
            style={{ minWidth: size + 12, minHeight: size + 12 }}
        >
            <OpenMoji hexcode={hexcode} size={size} alt={title} />
        </button>
    );
}

export default OpenMoji;
