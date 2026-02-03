'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { THEME_KEYS, DEFAULT_THEME } from '@/lib/themes';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme={DEFAULT_THEME}
            themes={THEME_KEYS}
            enableSystem={false}
            disableTransitionOnChange={false}
        >
            {children}
        </NextThemesProvider>
    );
}
