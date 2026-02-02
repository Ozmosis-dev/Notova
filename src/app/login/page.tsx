'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError(error.message)
                return
            }

            // Redirect to home page after successful login
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
            style={{ background: 'var(--surface-shell)' }}
        >
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center p-3"
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                                boxShadow: 'var(--shadow-lg)',
                            }}
                        >
                            <svg
                                viewBox="0 0 240 282.3"
                                className="w-full h-full"
                                fill="#1A1A1A"
                            >
                                <g>
                                    <path d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                                    <path d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                                </g>
                            </svg>
                        </div>
                        <h1
                            className="text-4xl font-bold"
                            style={{ color: 'var(--text-on-shell, var(--text-primary))' }}
                        >
                            Notova
                        </h1>
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
                        Welcome Back
                    </h1>
                    <p
                        className="mt-3"
                        style={{
                            fontSize: 'var(--font-body)',
                            color: 'var(--text-on-shell-secondary, var(--text-secondary))',
                        }}
                    >
                        Sign in to your account
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
                    <form onSubmit={handleLogin} className="space-y-6">
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
                                    autoComplete="current-password"
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
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                        <p
                            className="text-center"
                            style={{
                                fontSize: 'var(--font-small)',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Don&apos;t have an account?{' '}
                            <Link
                                href="/signup"
                                className="font-semibold transition-colors"
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
