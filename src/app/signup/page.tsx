'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // Auto-confirm email for development (no email confirmation required)
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                setError(error.message)
                return
            }

            // With auto-confirm, user is logged in immediately
            router.push('/')
            router.refresh()
        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background: 'var(--surface-shell)',
                color: '#1A1A1A', // Explicitly force text color
                // Force light theme warm editorial palette for consistency with login page
                // @ts-ignore
                '--surface-shell': '#FAF6EE',
                '--surface-content': '#fff5e6', // Ultra-soft cream
                '--surface-content-secondary': '#fff5e6',
                '--text-primary': '#1A1A1A',
                '--text-secondary': '#7A7168',
                '--text-on-shell': '#1A1A1A',
                '--text-on-shell-secondary': '#7A7168',
                '--text-on-accent': '#1A1A1A',
                '--accent-primary': '#E8783A',
                '--accent-secondary': '#E89A4A',
                '--border-primary': '#E8E0D0',
                '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            } as React.CSSProperties}
        >
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center p-4"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <svg
                            viewBox="0 0 273.1 281.4"
                            className="w-full h-full"
                            fill="#1A1A1A"
                        >
                            <path d="M223.9,0L46.9.2C21,.2,0,21.2,0,47.1l.4,186.5c0,26.3,22.1,47.8,49.2,47.8h174.3c27.1,0,49.2-21.4,49.2-47.8V47.8c0-26.3-22.1-47.8-49.2-47.8ZM153.3,39.3c-14.5,13.6-17.4,33.4-17.4,51.1v36.2c0,4-3.5,7.2-7.8,7.2h-38.8c-19.2,0-40.6,2.3-55.4,15.6l119.4-110ZM253.4,233.7c0,15.5-13.2,28.1-29.5,28.1H49.6c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h62.5c8.3,0,15-6.2,15-13.8v-50.7c0-41,25-67.3,49.3-67.3h19.5c14.4,1.8,25.6,13.6,25.6,27.8v185.9ZM25.1,59c18.6-4.7,30.4-15.5,34.2-34.9,0-.5.7-.5.8,0,4.7,17.8,14.6,29.9,33.1,34.4.5.1.5.8,0,.9-18.1,4.3-29.1,15-32.8,33.6,0,.5-.8.5-.9,0-4.4-18.5-15.5-29.5-34.4-33.2-.5,0-.5-.7,0-.9Z" />
                        </svg>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center">
                    <h1
                        className="font-bold"
                        style={{
                            fontSize: 'var(--font-display)',
                            color: 'var(--text-on-shell, var(--text-primary))',
                            lineHeight: 'var(--leading-tight)',
                        }}
                    >
                        Create Account
                    </h1>
                    <p
                        className="mt-3"
                        style={{
                            fontSize: 'var(--font-body)',
                            color: 'var(--text-on-shell-secondary, var(--text-secondary))',
                        }}
                    >
                        Start organizing your notes today
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="rounded-2xl p-8"
                    style={{
                        background: 'var(--surface-content)',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--border-primary)',
                    }}
                >
                    <form onSubmit={handleSignup} className="space-y-6">
                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(220, 38, 38, 0.1)',
                                    border: '1px solid rgba(220, 38, 38, 0.3)',
                                    color: '#DC2626',
                                    fontSize: 'var(--font-small)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block font-medium mb-2"
                                    style={{
                                        fontSize: 'var(--font-small)',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none"
                                    style={{
                                        background: 'var(--surface-content-secondary)',
                                        border: '1px solid var(--border-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: 'var(--font-body)',
                                    }}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block font-medium mb-2"
                                    style={{
                                        fontSize: 'var(--font-small)',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none"
                                    style={{
                                        background: 'var(--surface-content-secondary)',
                                        border: '1px solid var(--border-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: 'var(--font-body)',
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block font-medium mb-2"
                                    style={{
                                        fontSize: 'var(--font-small)',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl transition-all focus:outline-none"
                                    style={{
                                        background: 'var(--surface-content-secondary)',
                                        border: '1px solid var(--border-primary)',
                                        color: 'var(--text-primary)',
                                        fontSize: 'var(--font-body)',
                                    }}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                color: 'var(--text-on-accent)',
                                boxShadow: 'var(--shadow-md)',
                                fontSize: 'var(--font-body)',
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>

                        <p
                            className="text-center"
                            style={{
                                fontSize: 'var(--font-small)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-semibold transition-colors"
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
