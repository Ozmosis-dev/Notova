/**
 * OpenMoji Categories and Data
 * 
 * This module provides categorized OpenMoji data using hexcodes directly.
 * We use hexcodes instead of emoji characters to ensure consistent rendering.
 * 
 * PERFORMANCE: The ~2 MB openmoji-data.json is dynamically imported on first
 * use (when the emoji picker opens), keeping it out of the initial bundle.
 */

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

// ── Lazy-loaded state ────────────────────────────────────────────────
let _baseEmojis: OpenMojiDataEntry[] | null = null;
let _emojisByGroup: Record<string, OpenMojiEmoji[]> | null = null;
let _categories: typeof OPENMOJI_CATEGORIES_TEMPLATE | null = null;
let _loadPromise: Promise<void> | null = null;

/**
 * Dynamically imports openmoji-data.json and builds the category index.
 * Safe to call multiple times — subsequent calls return the cached promise.
 */
export async function loadOpenMojiData(): Promise<void> {
    if (_categories) return; // already loaded
    if (_loadPromise) return _loadPromise; // loading in progress

    _loadPromise = (async () => {
        const mod = await import('./openmoji-data.json');
        const openmojiData: OpenMojiDataEntry[] = mod.default as OpenMojiDataEntry[];

        // Filter out skin tone variants for cleaner display
        _baseEmojis = openmojiData.filter(e => !e.skintone);

        // Group emojis by their category
        _emojisByGroup = _baseEmojis.reduce((acc, emoji) => {
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

        // Build categories
        _categories = buildCategories(_emojisByGroup);
    })();

    return _loadPromise;
}

// ── Category template (used before data loads – emojis arrays are empty) ─
function buildCategories(groups: Record<string, OpenMojiEmoji[]> | null) {
    const g = groups ?? {};
    return {
        recent: {
            label: 'Recently Used',
            iconHexcode: '1F55B',
            emojis: [] as OpenMojiEmoji[],
        },
        'smileys-emotion': {
            label: 'Smileys & Emotion',
            iconHexcode: '1F600',
            emojis: g['smileys-emotion'] || [],
        },
        'people-body': {
            label: 'People & Body',
            iconHexcode: '1F44B',
            emojis: g['people-body'] || [],
        },
        'animals-nature': {
            label: 'Animals & Nature',
            iconHexcode: '1F43E',
            emojis: g['animals-nature'] || [],
        },
        'food-drink': {
            label: 'Food & Drink',
            iconHexcode: '1F34E',
            emojis: g['food-drink'] || [],
        },
        'travel-places': {
            label: 'Travel & Places',
            iconHexcode: '2708',
            emojis: g['travel-places'] || [],
        },
        activities: {
            label: 'Activities',
            iconHexcode: '26BD',
            emojis: g['activities'] || [],
        },
        objects: {
            label: 'Objects',
            iconHexcode: '1F4DD',
            emojis: g['objects'] || [],
        },
        symbols: {
            label: 'Symbols',
            iconHexcode: '2B50',
            emojis: g['symbols'] || [],
        },
        flags: {
            label: 'Flags',
            iconHexcode: '1F3F3-FE0F',
            emojis: g['flags'] || [],
        },
        'extras-openmoji': {
            label: 'OpenMoji Extras',
            iconHexcode: 'E000',
            emojis: g['extras-openmoji'] || [],
        },
        'extras-unicode': {
            label: 'Unicode Extras',
            iconHexcode: '2139-FE0F',
            emojis: g['extras-unicode'] || [],
        },
    } as const;
}

// Template used for typing – always available (with empty emoji arrays)
const OPENMOJI_CATEGORIES_TEMPLATE = buildCategories(null);

/**
 * Returns the fully-loaded categories object.
 * Returns the empty template if data hasn't loaded yet.
 */
export function getCategories(): typeof OPENMOJI_CATEGORIES_TEMPLATE {
    return _categories ?? OPENMOJI_CATEGORIES_TEMPLATE;
}

// Keep backwards-compatible named export for category key typing
export const OPENMOJI_CATEGORIES = OPENMOJI_CATEGORIES_TEMPLATE;
export type CategoryKey = keyof typeof OPENMOJI_CATEGORIES_TEMPLATE;

/**
 * Get the SVG path for an OpenMoji by hexcode
 */
export function getOpenMojiSvgPath(hexcode: string): string {
    return `/openmoji/${hexcode}.svg`;
}

/**
 * Search emojis by annotation or tags.
 * Returns empty array if data hasn't loaded yet.
 */
export function searchEmojis(query: string): OpenMojiEmoji[] {
    if (!query.trim() || !_baseEmojis) return [];

    const lowerQuery = query.toLowerCase();
    const results: OpenMojiEmoji[] = [];

    for (const emoji of _baseEmojis) {
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

    return results.slice(0, 100);
}

/**
 * Get emoji by hexcode.
 * Returns undefined if data hasn't loaded yet.
 */
export function getEmojiByHexcode(hexcode: string): OpenMojiEmoji | undefined {
    if (!_baseEmojis) return undefined;

    const emoji = _baseEmojis.find(e => e.hexcode === hexcode);
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
 * Get all available emojis (for lazy loading).
 * Returns empty array if data hasn't loaded yet.
 */
export function getAllEmojis(): OpenMojiEmoji[] {
    if (!_baseEmojis) return [];

    return _baseEmojis.map(e => ({
        hexcode: e.hexcode,
        annotation: e.annotation,
        tags: e.tags,
        openmoji_tags: e.openmoji_tags,
        group: e.group,
        subgroups: e.subgroups,
    }));
}
