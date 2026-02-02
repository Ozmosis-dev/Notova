/**
 * OpenMoji Categories and Data
 * 
 * This module provides categorized OpenMoji data using hexcodes directly.
 * We use hexcodes instead of emoji characters to ensure consistent rendering.
 */

// Import the full OpenMoji dataset
import openmojiData from './openmoji-data.json';

export interface OpenMojiEmoji {
    hexcode: string;
    annotation: string;
    tags: string;
    openmoji_tags: string;
    group: string;
    subgroups: string;
}

// Type for the JSON data
interface OpenMojiDataEntry {
    emoji: string;
    hexcode: string;
    group: string;
    subgroups: string;
    annotation: string;
    tags: string;
    openmoji_tags: string;
    skintone: string;
    skintone_combination: string;
    unicode: number | string;
    order: number | string;
}

// Filter out skin tone variants for cleaner display
const baseEmojis = (openmojiData as OpenMojiDataEntry[]).filter(e => !e.skintone);

// Group emojis by their category
const emojisByGroup = baseEmojis.reduce((acc, emoji) => {
    if (!acc[emoji.group]) {
        acc[emoji.group] = [];
    }
    acc[emoji.group]!.push({
        hexcode: emoji.hexcode,
        annotation: emoji.annotation,
        tags: emoji.tags,
        openmoji_tags: emoji.openmoji_tags,
        group: emoji.group,
        subgroups: emoji.subgroups,
    });
    return acc;
}, {} as Record<string, OpenMojiEmoji[]>);

// Category configuration with icons and labels
export const OPENMOJI_CATEGORIES = {
    recent: {
        label: 'Recently Used',
        iconHexcode: '1F55B', // Clock face twelve-thirty
        emojis: [] as OpenMojiEmoji[],
    },
    'smileys-emotion': {
        label: 'Smileys & Emotion',
        iconHexcode: '1F600', // Grinning face
        emojis: emojisByGroup['smileys-emotion'] || [],
    },
    'people-body': {
        label: 'People & Body',
        iconHexcode: '1F44B', // Waving hand
        emojis: emojisByGroup['people-body'] || [],
    },
    'animals-nature': {
        label: 'Animals & Nature',
        iconHexcode: '1F43E', // Paw prints
        emojis: emojisByGroup['animals-nature'] || [],
    },
    'food-drink': {
        label: 'Food & Drink',
        iconHexcode: '1F34E', // Red apple
        emojis: emojisByGroup['food-drink'] || [],
    },
    'travel-places': {
        label: 'Travel & Places',
        iconHexcode: '2708', // Airplane (without variation selector for better compatibility)
        emojis: emojisByGroup['travel-places'] || [],
    },
    activities: {
        label: 'Activities',
        iconHexcode: '26BD', // Soccer ball
        emojis: emojisByGroup['activities'] || [],
    },
    objects: {
        label: 'Objects',
        iconHexcode: '1F4DD', // Memo
        emojis: emojisByGroup['objects'] || [],
    },
    symbols: {
        label: 'Symbols',
        iconHexcode: '2B50', // Star
        emojis: emojisByGroup['symbols'] || [],
    },
    flags: {
        label: 'Flags',
        iconHexcode: '1F3F3-FE0F', // White flag
        emojis: emojisByGroup['flags'] || [],
    },
    'extras-openmoji': {
        label: 'OpenMoji Extras',
        iconHexcode: 'E000', // OpenMoji logo or custom
        emojis: emojisByGroup['extras-openmoji'] || [],
    },
    'extras-unicode': {
        label: 'Unicode Extras',
        iconHexcode: '2139-FE0F', // Information
        emojis: emojisByGroup['extras-unicode'] || [],
    },
} as const;

export type CategoryKey = keyof typeof OPENMOJI_CATEGORIES;

/**
 * Get the SVG path for an OpenMoji by hexcode
 */
export function getOpenMojiSvgPath(hexcode: string): string {
    return `/openmoji/${hexcode}.svg`;
}

/**
 * Search emojis by annotation or tags
 */
export function searchEmojis(query: string): OpenMojiEmoji[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: OpenMojiEmoji[] = [];

    for (const emoji of baseEmojis) {
        const searchText = `${emoji.annotation} ${emoji.tags} ${emoji.openmoji_tags}`.toLowerCase();
        if (searchText.includes(lowerQuery)) {
            results.push({
                hexcode: emoji.hexcode,
                annotation: emoji.annotation,
                tags: emoji.tags,
                openmoji_tags: emoji.openmoji_tags,
                group: emoji.group,
                subgroups: emoji.subgroups,
            });
        }
    }

    return results.slice(0, 100); // Limit search results
}

/**
 * Get emoji by hexcode
 */
export function getEmojiByHexcode(hexcode: string): OpenMojiEmoji | undefined {
    const emoji = baseEmojis.find(e => e.hexcode === hexcode);
    if (!emoji) return undefined;

    return {
        hexcode: emoji.hexcode,
        annotation: emoji.annotation,
        tags: emoji.tags,
        openmoji_tags: emoji.openmoji_tags,
        group: emoji.group,
        subgroups: emoji.subgroups,
    };
}

/**
 * Get all available emojis (for lazy loading)
 */
export function getAllEmojis(): OpenMojiEmoji[] {
    return baseEmojis.map(e => ({
        hexcode: e.hexcode,
        annotation: e.annotation,
        tags: e.tags,
        openmoji_tags: e.openmoji_tags,
        group: e.group,
        subgroups: e.subgroups,
    }));
}
