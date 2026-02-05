'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { DEFAULT_THEME, ThemeKey, isValidTheme } from '@/lib/themes'

// localStorage key used by next-themes
const THEME_STORAGE_KEY = 'theme'

interface AuthContextType {
    user: User | null
    userTheme: ThemeKey
    loading: boolean
    signOut: () => Promise<void>
    updateTheme: (theme: ThemeKey) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to get theme from localStorage immediately (no async delay)
function getStoredTheme(): ThemeKey {
    if (typeof window === 'undefined') return DEFAULT_THEME
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY)
        if (stored && isValidTheme(stored)) {
            return stored as ThemeKey
        }
    } catch {
        // localStorage might be blocked
    }
    return DEFAULT_THEME
}

export function AuthProvider({ children }: { children: ReactNode }) {
    // Initialize theme from localStorage immediately for instant load
    const [user, setUser] = useState<User | null>(null)
    const [userTheme, setUserTheme] = useState<ThemeKey>(getStoredTheme)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session - theme is already loaded from localStorage
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)

            // If user is logged in, fetch theme from server in background
            // This ensures localStorage stays in sync with the database
            // but doesn't block the initial render
            if (user) {
                fetch('/api/user/theme')
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data?.theme && isValidTheme(data.theme)) {
                            // Only update if different from current
                            if (data.theme !== getStoredTheme()) {
                                setUserTheme(data.theme)
                                // Also update localStorage for next load
                                try {
                                    localStorage.setItem(THEME_STORAGE_KEY, data.theme)
                                } catch {
                                    // Ignore localStorage errors
                                }
                            }
                        }
                    })
                    .catch(err => console.error('Error fetching user theme:', err))
            }
        }
        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    // Fetch theme in background when user logs in
                    try {
                        const response = await fetch('/api/user/theme')
                        if (response.ok) {
                            const data = await response.json()
                            if (data.theme && isValidTheme(data.theme)) {
                                setUserTheme(data.theme)
                                try {
                                    localStorage.setItem(THEME_STORAGE_KEY, data.theme)
                                } catch {
                                    // Ignore
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching user theme:', error)
                    }
                } else {
                    // Reset to default when logged out
                    setUserTheme(DEFAULT_THEME)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase.auth])

    const updateTheme = useCallback(async (theme: ThemeKey) => {
        if (!isValidTheme(theme)) {
            return
        }

        // Optimistically update local state and localStorage
        setUserTheme(theme)
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme)
        } catch {
            // localStorage might be blocked
        }

        // Persist to server in background
        try {
            const response = await fetch('/api/user/theme', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme })
            })

            if (!response.ok) {
                console.error('Failed to update theme on server')
            }
        } catch (error) {
            console.error('Error updating theme:', error)
        }
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setUserTheme(DEFAULT_THEME)
        try {
            localStorage.removeItem(THEME_STORAGE_KEY)
        } catch {
            // Ignore
        }
        window.location.href = '/login'
    }

    return (
        <AuthContext.Provider value={{ user, userTheme, loading, signOut, updateTheme }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
