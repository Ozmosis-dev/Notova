/**
 * OpenMoji Utility Functions
 * 
 * This module provides utilities for converting emoji characters to OpenMoji
 * codepoint format and generating paths to OpenMoji SVG files.
 */

/**
 * Converts an emoji character (or sequence) to its OpenMoji-compatible codepoint filename.
 * 
 * OpenMoji uses the following format for filenames:
 * - Single codepoint: "1F600.svg" (for 😀)
 * - Multiple codepoints: "1F468-200D-1F4BB.svg" (for 👨‍💻)
 * - Skin tone modifiers: "1F44D-1F3FB.svg" (for 👍🏻)
 * 
 * @param emoji - The emoji character(s) to convert
 * @returns The codepoint string in OpenMoji format (e.g., "1F600" or "1F468-200D-1F4BB")
 */
export function emojiToCodepoint(emoji: string): string {
    if (!emoji) return '';

    // Convert emoji to an array of codepoints
    const codepoints: string[] = [];

    // Use the spread operator to properly handle surrogate pairs and ZWJ sequences
    for (const char of emoji) {
        const codepoint = char.codePointAt(0);
        if (codepoint !== undefined) {
            // Convert to uppercase hex, filter out VS16 (FE0F) if present alone
            // VS16 is the variation selector for emoji presentation
            const hex = codepoint.toString(16).toUpperCase();
            codepoints.push(hex);
        }
    }

    // Join with hyphens for the OpenMoji filename format
    return codepoints.join('-');
}

/**
 * Generates the path to an OpenMoji SVG file for the given emoji.
 * 
 * @param emoji - The emoji character to get the path for
 * @returns The path to the OpenMoji SVG file
 */
export function getOpenMojiPath(emoji: string): string {
    const codepoint = emojiToCodepoint(emoji);
    return `/openmoji/${codepoint}.svg`;
}

/**
 * Array of fallback paths to try if the primary OpenMoji file doesn't exist.
 * Some emojis have multiple valid representations (with/without VS16).
 * 
 * @param emoji - The emoji character to get fallback paths for
 * @returns Array of possible paths to try
 */
export function getOpenMojiFallbacks(emoji: string): string[] {
    const primary = getOpenMojiPath(emoji);
    const codepoint = emojiToCodepoint(emoji);

    const paths = [primary];

    // Try without FE0F (variation selector)
    if (codepoint.includes('-FE0F')) {
        paths.push(`/openmoji/${codepoint.replace(/-FE0F/g, '')}.svg`);
    }

    // Try with FE0F if not present (some emojis need it)
    if (!codepoint.includes('-FE0F') && codepoint.length === 4 || codepoint.length === 5) {
        paths.push(`/openmoji/${codepoint}-FE0F.svg`);
    }

    return paths;
}

/**
 * Common emoji to OpenMoji codepoint mapping for quick lookups.
 * This is useful for emojis that have known special cases.
 */
export const EMOJI_CODEPOINT_MAP: Record<string, string> = {
    // Common emojis with special handling
    '❤️': '2764-FE0F',
    '❤': '2764',
    '⭐': '2B50',
    '⭐️': '2B50',
    '✨': '2728',
    '⚡': '26A1',
    '⚡️': '26A1',
    '☀️': '2600-FE0F',
    '☁️': '2601-FE0F',
    '☔': '2614',
    '⛅': '26C5',
    '✏️': '270F-FE0F',
    '✏': '270F',
    '☕': '2615',
    '☕️': '2615',
    '✅': '2705',
    '❌': '274C',
    '⚠️': '26A0-FE0F',
    '⚠': '26A0',
    '♻️': '267B-FE0F',
    '♻': '267B',
};

/**
 * Gets the OpenMoji codepoint for an emoji, checking the mapping first.
 * Falls back to generating the codepoint if not in the map.
 * 
 * @param emoji - The emoji character
 * @returns The codepoint string
 */
export function getEmojiCodepoint(emoji: string): string {
    // Check if we have a known mapping
    if (EMOJI_CODEPOINT_MAP[emoji]) {
        return EMOJI_CODEPOINT_MAP[emoji];
    }
    return emojiToCodepoint(emoji);
}

/**
 * Checks if a given emoji likely has an OpenMoji representation.
 * This is a heuristic check based on the codepoint range.
 * 
 * @param emoji - The emoji to check
 * @returns Boolean indicating if the emoji is likely supported
 */
export function isEmojiSupported(emoji: string): boolean {
    if (!emoji) return false;

    const firstCodepoint = emoji.codePointAt(0);
    if (!firstCodepoint) return false;

    // Most emojis are in these ranges:
    // - 0x1F000 - 0x1FFFF (Miscellaneous Symbols and Pictographs, Emoticons, etc.)
    // - 0x2600 - 0x27BF (Miscellaneous Symbols)
    // - 0x2300 - 0x23FF (Miscellaneous Technical)
    return (
        (firstCodepoint >= 0x1F000 && firstCodepoint <= 0x1FFFF) ||
        (firstCodepoint >= 0x2600 && firstCodepoint <= 0x27BF) ||
        (firstCodepoint >= 0x2300 && firstCodepoint <= 0x23FF) ||
        (firstCodepoint >= 0x2190 && firstCodepoint <= 0x21FF)
    );
}
