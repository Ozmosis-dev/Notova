// Theme configuration for user-specific theme selection
// Defines available themes and their metadata

import { Sun, Moon, Flame, Snowflake, Leaf, Flower } from 'lucide-react';

export const THEMES = {
    light: {
        name: 'Light',
        icon: Sun,
        description: 'Clean and bright',
        preview: {
            shell: '#FAF6EE',
            content: '#FFFDF8',
            accent: '#E8783A'
        }
    },
    dark: {
        name: 'Dark',
        icon: Moon,
        description: 'True black',
        preview: {
            shell: '#000000',
            content: '#0A0A0A',
            accent: '#E8783A'
        }
    },
    warm: {
        name: 'Warm',
        icon: Flame,
        description: 'Cream content',
        preview: {
            shell: '#1A1A1A',
            content: '#F5ECD7',
            accent: '#E8783A'
        }
    },
    cool: {
        name: 'Cool',
        icon: Snowflake,
        description: 'Modern blue',
        preview: {
            shell: '#0F172A',
            content: '#1E293B',
            accent: '#3B82F6'
        }
    },
    earth: {
        name: 'Earth',
        icon: Leaf,
        description: 'Natural tones',
        preview: {
            shell: '#4A5D4A',
            content: '#F5ECD7',
            accent: '#6B8E5A'
        }
    },
    spring: {
        name: 'Spring',
        icon: Flower,
        description: 'Playful pastels',
        preview: {
            shell: '#FFE5EC',
            content: '#FFFBF8',
            accent: '#FF8FAB'
        }
    },
    midnight: {
        name: 'Midnight',
        icon: Moon,
        description: 'Deep purple night',
        preview: {
            shell: '#1A0F2E',
            content: '#2D1B4E',
            accent: '#A78BFA'
        }
    },
    autumn: {
        name: 'Autumn',
        icon: Flame,
        description: 'Sunset warmth',
        preview: {
            shell: '#6B2D2D',
            content: '#FFF8F0',
            accent: '#D84A4A'
        }
    }
} as const;

export type ThemeKey = keyof typeof THEMES;
export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];
export const DEFAULT_THEME: ThemeKey = 'dark';

// Type guard to check if a string is a valid theme
export function isValidTheme(theme: string): theme is ThemeKey {
    return theme in THEMES;
}
