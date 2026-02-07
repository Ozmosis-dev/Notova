'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from './AuthProvider';

/**
 * UserThemeProvider syncs the user's theme preference from the database
 * with the next-themes provider. This component should be placed inside
 * both ThemeProvider and AuthProvider.
 */
export function UserThemeProvider({ children }: { children: React.ReactNode }) {
    const { userTheme } = useAuth();
    const { setTheme, theme, resolvedTheme } = useTheme();
    const lastSyncedTheme = useRef<string | null>(null);
    const mounted = useRef(false);

    // DEBUG: Log theme state changes (only in development or when debug flag is set)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' || localStorage.getItem('debug_theme') === 'true') {
            console.log('[ThemeSync] State:', {
                userTheme,
                theme,
                resolvedTheme,
                lastSynced: lastSyncedTheme.current,
                mounted: mounted.current
            });
        }
    }, [userTheme, theme, resolvedTheme]);

    // Mark as mounted after first render to avoid hydration issues
    useEffect(() => {
        mounted.current = true;
    }, []);

    // Sync user's theme preference with next-themes
    // Use `theme` instead of `resolvedTheme` to avoid race conditions
    // resolvedTheme can be affected by system preference, causing false positives
    useEffect(() => {
        // Wait until mounted to avoid hydration mismatch
        if (!mounted.current) return;

        if (userTheme && userTheme !== lastSyncedTheme.current) {
            lastSyncedTheme.current = userTheme;
            // Compare against the actual theme value, not resolvedTheme
            if (userTheme !== theme) {
                if (process.env.NODE_ENV === 'development' || localStorage.getItem('debug_theme') === 'true') {
                    console.log('[ThemeSync] Syncing theme:', { from: theme, to: userTheme });
                }
                setTheme(userTheme);
            }
        }
    }, [userTheme, setTheme, theme]);

    return <>{children}</>;
}
