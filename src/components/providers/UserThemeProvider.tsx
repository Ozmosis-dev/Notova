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
    const { setTheme, resolvedTheme } = useTheme();
    const lastSyncedTheme = useRef<string | null>(null);

    // Sync user's theme preference with next-themes
    // Only sync when userTheme changes from the server, not when theme changes locally
    useEffect(() => {
        if (userTheme && userTheme !== lastSyncedTheme.current) {
            lastSyncedTheme.current = userTheme;
            // Only update if the current theme is different
            if (userTheme !== resolvedTheme) {
                setTheme(userTheme);
            }
        }
    }, [userTheme, setTheme, resolvedTheme]);

    return <>{children}</>;
}
