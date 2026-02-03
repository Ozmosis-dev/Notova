'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Layers, Zap, FileText, Brain, Wifi, Search, Tag } from 'lucide-react'

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
        <div className="min-h-screen relative overflow-hidden text-primary" style={{
            background: 'var(--surface-shell)',
            // Force light theme warm editorial palette for the landing page regardless of system preference
            // @ts-ignore
            '--surface-shell': '#FAF6EE',
            '--text-primary': '#1A1A1A',
            '--text-secondary': '#7A7168',
            '--accent-primary': '#E8783A',
            '--accent-secondary': '#E89A4A',
            '--border-primary': '#E8E0D0',
            '--highlight-soft': 'rgba(242, 212, 102, 0.3)'
        } as React.CSSProperties}>

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-30 blur-[100px]"
                    style={{ background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
                    style={{ background: 'radial-gradient(circle, var(--surface-card-gold) 0%, transparent 70%)' }} />
            </div>

            {/* Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-9 md:h-9 relative">
                        <svg viewBox="0 0 240 282.3" className="w-full h-full">
                            <defs>
                                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--accent-primary)" />
                                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#logoGradient)" d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                            <path fill="url(#logoGradient)" d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                        </svg>
                    </div>
                    <span className="font-bold text-2xl tracking-tight">Notova</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth' })}
                        className="md:hidden px-5 py-2.5 rounded-full font-bold text-sm text-white shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                        }}
                    >
                        Sign In
                    </button>
                    <Link href="/signup"
                        className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90"
                        style={{
                            background: '#1A1A1A',
                            color: '#FFFFFF',
                            border: 'none'
                        }}>
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Column: Copy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-md shadow-orange-500/10"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            color: '#FFFFFF'
                        }}>
                        <Sparkles size={12} />
                        <span>Best note taking app of 2026</span>
                    </div>

                    <div className="relative">
                        <h1 className="text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                            Capture your <br />
                            <span className="gradient-text">best ideas</span> <br />
                            <span className="relative inline-block">
                                <span className="relative z-10">
                                    beautifully.
                                </span>
                                <motion.svg
                                    viewBox="0 0 286 19"
                                    className="absolute -bottom-2 -left-2 w-[110%] h-auto z-0"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                                >
                                    <path
                                        d="M5 12 Q 143 5 281 12"
                                        stroke="url(#brushGradient)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        fill="none"
                                    />
                                    <defs>
                                        <linearGradient id="brushGradient" x1="0" y1="0" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="var(--accent-primary)" />
                                            <stop offset="100%" stopColor="var(--accent-secondary)" />
                                        </linearGradient>
                                    </defs>
                                </motion.svg>
                            </span>
                        </h1>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1, rotate: 15 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.8 }}
                            className="absolute -top-12 -right-8 md:-right-16 z-20 hidden md:block"
                        >
                            <div className="relative w-28 h-28 lg:w-32 lg:h-32 flex items-center justify-center">
                                {/* Image Starburst Badge */}
                                <Image
                                    src="/badge-starburst.png"
                                    alt="Best Evernote Alternative Badge"
                                    fill
                                    className="object-contain drop-shadow-lg"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center transform -rotate-12 z-10 pl-1 pt-1">
                                    <div className="text-white font-bold text-[10px] lg:text-xs leading-none flex flex-col items-center gap-0.5">
                                        <div className="flex items-center gap-1">
                                            <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#E8783A]" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span>Best</span>
                                        </div>
                                        <span>Evernote</span>
                                        <span>Alternative</span>
                                        <span>in 2026</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <p className="text-xl text-secondary max-w-lg leading-relaxed">
                        A modern, intelligent workspace that helps you organize your thoughts, projects, and life with unmatched elegance and simplicity.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 border border-white/60 shadow-sm text-sm font-medium text-secondary">
                            <FileText size={16} className="text-(--accent-primary)" />
                            <span>.enex Import</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 border border-white/60 shadow-sm text-sm font-medium text-secondary">
                            <Brain size={16} className="text-(--accent-primary)" />
                            <span>AI Summaries</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 border border-white/60 shadow-sm text-sm font-medium text-secondary">
                            <Wifi size={16} className="text-(--accent-primary)" />
                            <span>Seamless Sync</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 border border-white/60 shadow-sm text-sm font-medium text-secondary">
                            <Search size={16} className="text-(--accent-primary)" />
                            <span>Smart Search</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/50 border border-white/60 shadow-sm text-sm font-medium text-secondary">
                            <Tag size={16} className="text-(--accent-primary)" />
                            <span>Custom Tags</span>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Login Card & Mockup */}
                <div className="relative">
                    {/* Floating Mockup Behind */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="absolute top-[-100px] right-[-50px] w-full h-[600px] hidden lg:block z-0 transform -rotate-6"
                    >
                        <Image
                            src="/images/app-mockup.png"
                            alt="Notova App Interface"
                            fill
                            className="object-contain drop-shadow-2xl opacity-80"
                            priority
                        />
                    </motion.div>

                    {/* Login Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        id="login-card"
                        className="relative z-10 glass-warm rounded-3xl p-8 shadow-warm-xl border border-white/40 backdrop-blur-xl max-w-md mx-auto lg:ml-auto"
                    >
                        {/* Mobile Badge - Overlapping Top Right */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0, rotate: 15 }}
                            animate={{ opacity: 1, scale: 1, rotate: 15 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
                            className="absolute -top-12 -right-3 z-20 md:hidden block pointer-events-none"
                        >
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                {/* Image Starburst Badge */}
                                <Image
                                    src="/badge-starburst.png"
                                    alt="Best Evernote Alternative Badge"
                                    fill
                                    className="object-contain drop-shadow-md"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center transform -rotate-12 z-10 pl-1 pt-1">
                                    <div className="text-white font-bold text-[10px] leading-none flex flex-col items-center gap-0.5">
                                        <div className="flex items-center gap-1">
                                            <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#E8783A]" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span>Best</span>
                                        </div>
                                        <span>Evernote</span>
                                        <span>Alternative</span>
                                        <span>in 2026</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                            <p className="text-secondary text-sm">Enter your credentials to access your workspace</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5 ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3.5 rounded-xl bg-white/60 border border-transparent focus:bg-white focus:border-(--accent-primary) focus:ring-0 transition-all outline-none text-base"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5 ml-1">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3.5 rounded-xl bg-white/60 border border-transparent focus:bg-white focus:border-(--accent-primary) focus:ring-0 transition-all outline-none text-base"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-secondary">
                            Don't have an account? <Link href="/signup" className="font-bold underline decoration-2 decoration-(--accent-primary) hover:text-primary transition-colors">Join Notova</Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Features Preview Strip */}
            <div className="relative z-10 border-t border-white/10 bg-[#1A1A1A]">
                <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
                    {/* Define gradient for icons */}
                    <svg width="0" height="0" className="absolute">
                        <defs>
                            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--accent-primary)" />
                                <stop offset="100%" stopColor="var(--accent-secondary)" />
                            </linearGradient>
                        </defs>
                    </svg>


                    {[
                        {
                            title: 'Smart Organization',
                            desc: 'Auto-tagging and nested folders keep your mind clear.',
                            Icon: Layers,
                            img: '/images/feature-org.png'
                        },
                        {
                            title: 'AI Summaries',
                            desc: 'Turn messy meeting notes into actionable insights instantly.',
                            Icon: Sparkles,
                            img: '/images/feature-ai.png'
                        },
                        {
                            title: 'Seamless Sync',
                            desc: 'Access your brain from any device, anywhere, anytime.',
                            Icon: Zap,
                            img: '/images/app-mockup.png' // Using app mockup as placeholder for sync
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <feature.Icon className="stroke-[url(#iconGradient)]" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">{feature.desc}</p>
                            <div className="relative h-40 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                                <Image src={feature.img} alt={feature.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-black text-white py-8 border-t border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
                    <p>© 2026 Notova Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
