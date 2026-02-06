'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, Variants, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, FileText, Brain, Wifi, Search, Tag, Palette, FileDown, Mail } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ThemeKey } from '@/lib/themes'

// Animation variants for staggered reveals and micro-interactions
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
        }
    }
}

const slideInLeftVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 15
        }
    }
}

const slideInRightVariants: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 15
        }
    }
}

const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
}

const featureBadgeVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 14
        }
    }
}

// Hover interaction variants
const buttonHoverVariants = {
    rest: { scale: 1 },
    hover: {
        scale: 1.02,
        transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    },
    tap: { scale: 0.98 }
}

// Floating animation variants for parallax depth effect
const floatingSlowVariants = {
    animate: {
        y: [0, -8, 0],
        transition: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut" as const
        }
    }
}

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { theme, setTheme } = useTheme()

    // Scroll-based parallax for dimensional hero effect
    const { scrollY } = useScroll()
    const heroTextY = useTransform(scrollY, [0, 300], [0, 30])
    const heroCardY = useTransform(scrollY, [0, 300], [0, -20])
    const heroBadgeY = useTransform(scrollY, [0, 300], [0, 50])

    // Set warm theme as default for login page on first visit
    useEffect(() => {
        setMounted(true)
        // Only set default if no theme has been explicitly chosen
        const storedTheme = localStorage.getItem('theme')
        if (!storedTheme || storedTheme === 'system') {
            setTheme('warm')
        }
    }, [setTheme])

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

    // Handle theme selection from carousel
    const handleThemeSelect = (themeName: string) => {
        const themeKey = themeName.toLowerCase() as ThemeKey
        setTheme(themeKey)
    }

    return (
        <div className="min-h-screen relative overflow-hidden surface-shell text-primary">

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

                {/* Left Column: Copy - Staggered reveal with slide-in + parallax */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ y: heroTextY }}
                    className="space-y-8"
                >
                    {/* Badge with slide + fade */}
                    <motion.div
                        variants={slideInLeftVariants}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-md shadow-orange-500/10 cursor-default"
                        whileHover={{ scale: 1.05, boxShadow: "0 8px 25px -5px rgba(232, 120, 58, 0.3)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            color: '#FFFFFF'
                        }}>
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Sparkles size={12} />
                        </motion.div>
                        <span>Best note taking app of 2026</span>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative">
                        <h1 className="text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                            Capture your
                            <br />
                            <span className="gradient-text">best ideas</span>
                            <br />
                            <span className="relative inline-block">
                                <span className="relative z-10">
                                    beautifully.
                                </span>
                                <motion.svg
                                    viewBox="0 0 286 19"
                                    className="absolute -bottom-2 -left-2 w-[110%] h-auto z-0"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
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

                        {/* Floating Badge with parallax and ambient float */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1, rotate: 15 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.8 }}
                            whileHover={{ scale: 1.1, rotate: 20 }}
                            style={{ y: heroBadgeY }}
                            className="absolute -top-12 -right-8 md:-right-16 z-20 hidden md:block cursor-pointer"
                        >
                            <motion.div
                                className="relative w-28 h-28 lg:w-32 lg:h-32 flex items-center justify-center"
                                variants={floatingSlowVariants}
                                animate="animate"
                            >
                                {/* Image Starburst Badge */}
                                <motion.div
                                    className="absolute inset-0"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Image
                                        src="/badge-starburst.png"
                                        alt="Best Evernote Alternative Badge"
                                        fill
                                        className="object-contain drop-shadow-lg"
                                    />
                                </motion.div>
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
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.p
                        variants={itemVariants}
                        className="text-xl max-w-lg leading-relaxed"
                        style={{ color: 'var(--text-on-shell)', opacity: 0.85 }}
                    >
                        A modern, intelligent workspace that helps you organize your thoughts, projects, and life with unmatched elegance and simplicity.
                    </motion.p>

                    {/* Feature badges with staggered reveal and hover micro-interactions */}
                    <motion.div
                        variants={containerVariants}
                        className="flex flex-wrap gap-3 pt-4"
                    >
                        {[
                            { icon: FileText, label: '.enex Import' },
                            { icon: Brain, label: 'AI Summaries' },
                            { icon: Wifi, label: 'Seamless Sync' },
                            { icon: Search, label: 'Smart Search' },
                            { icon: Tag, label: 'Tag & Filter' },
                            { icon: Palette, label: 'Custom Themes' },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={featureBadgeVariants}
                                whileHover={{
                                    scale: 1.08,
                                    y: -2,
                                    boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.15)",
                                    transition: { type: "spring", stiffness: 400, damping: 17 }
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm cursor-default select-none"
                                style={{
                                    background: 'color-mix(in srgb, var(--surface-content) 70%, transparent)',
                                    border: '1px solid color-mix(in srgb, var(--border-primary) 50%, transparent)',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <feature.icon size={16} style={{ color: 'var(--accent-primary)' }} />
                                </motion.div>
                                <span>{feature.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Right Column: Login Card & Mockup - Slide in from right + parallax */}
                <motion.div
                    className="relative"
                    variants={slideInRightVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ y: heroCardY }}
                >
                    {/* Floating Mockup Behind */}


                    {/* Login Card */}
                    <div className="relative isolate">
                        {/* Animated Gradient Background */}
                        {/* Animated Gradient Background */}
                        <div
                            className="absolute top-[20%] left-[20%] -right-8 -bottom-8 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-primary)] rounded-[3rem] opacity-40 blur-[90px] animate-gradient-flow pointer-events-none -z-20"
                            aria-hidden="true"
                        />
                        {/* Softening Overlay */}
                        <div
                            className="absolute inset-0 bg-[var(--surface-shell)]/10 rounded-3xl -z-10 pointer-events-none mix-blend-overlay"
                            aria-hidden="true"
                        />
                        <motion.div
                            variants={scaleInVariants}
                            id="login-card"
                            className="relative z-10 glass-warm rounded-3xl p-8 shadow-warm-lg border border-black/5 backdrop-blur-xl max-w-md mx-auto lg:ml-auto"
                            whileHover={{
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                transition: { duration: 0.3 }
                            }}
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
                            <div className="mb-8 text-left md:text-center">
                                <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Welcome to Notova</h2>
                                <p className="text-sm" style={{ color: '#5A534B' }}>Enter your credentials to access your workspace</p>
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
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1" style={{ color: '#6B635B' }}>Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-3.5 rounded-xl border transition-all text-base font-sans shadow-none focus:ring-0 !outline-none focus:outline-none focus-visible:outline-none focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-none"
                                            style={{
                                                outline: 'none',
                                                boxShadow: 'none',
                                                backgroundColor: '#F7F3ED',
                                                color: '#3A3530',
                                                borderColor: '#E5DDD0',
                                                fontFamily: 'var(--font-lufga), system-ui, -apple-system, sans-serif',
                                            }}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 ml-1" style={{ color: '#6B635B' }}>Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full px-4 py-3.5 rounded-xl border transition-all text-base font-sans shadow-none focus:ring-0 !outline-none focus:outline-none focus-visible:outline-none focus-visible:!outline-none focus-visible:ring-0 focus-visible:shadow-none"
                                            style={{
                                                outline: 'none',
                                                boxShadow: 'none',
                                                backgroundColor: '#F7F3ED',
                                                color: '#3A3530',
                                                borderColor: '#E5DDD0',
                                                fontFamily: 'var(--font-lufga), system-ui, -apple-system, sans-serif',
                                            }}
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Sign In Button with Glow Effect */}
                                <div className="relative group/btn">
                                    {/* Animated Glow Background */}
                                    <motion.div
                                        className="absolute -inset-1 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-xl transition-opacity duration-500"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        }}
                                        animate={{
                                            scale: [1, 1.02, 1],
                                            opacity: [0.4, 0.6, 0.4],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        className="relative w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                            boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--accent-primary) 20%, transparent)'
                                        }}
                                        variants={buttonHoverVariants}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        {loading ? 'Signing in...' : 'Sign In'}
                                        {!loading && (
                                            <motion.span
                                                animate={{ x: 0 }}
                                                whileHover={{ x: 4 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                            >
                                                <ArrowRight size={18} />
                                            </motion.span>
                                        )}
                                    </motion.button>
                                </div>
                            </form>

                            <motion.div
                                className="mt-6 text-center text-sm"
                                style={{ color: '#5A534B' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                Don't have an account?{' '}
                                <Link
                                    href="/signup"
                                    className="font-bold underline decoration-2 hover:opacity-80 transition-opacity relative group"
                                    style={{ color: 'var(--accent-primary)', textDecorationColor: 'var(--accent-primary)' }}
                                >
                                    <span className="relative z-10">Join Notova</span>
                                    <motion.span
                                        className="absolute inset-0 -m-1 rounded bg-[var(--accent-primary)]/10 z-0"
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileHover={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>

            {/* Features Preview Strip */}
            <div className="relative z-10 border-t border-white/10 bg-[#1A1A1A]">
                {/* Custom Themes Carousel - Full Width Top Section */}
                <div className="w-full py-8 relative overflow-hidden">
                    {/* Fade Gradients */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-linear-to-r from-[#1A1A1A] to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-linear-to-l from-[#1A1A1A] to-transparent pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-6 mb-6 relative z-20">
                        <span className="px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm">
                            Choose Your Aesthetic
                        </span>
                    </div>

                    <div className="flex">
                        <motion.div
                            className="flex gap-4 items-center pl-4"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                duration: 40,
                                ease: "linear",
                                repeat: Infinity,
                                repeatType: "loop"
                            }}
                        >
                            {[
                                { name: 'Light', bg: '#FAF6EE', accent: '#E8783A', text: '#4B4B4B' },
                                { name: 'Dark', bg: '#000000', accent: '#EAB308', text: '#FFFFFF', border: true },
                                { name: 'Warm', bg: '#1A1A1A', accent: '#E8783A', text: '#F5ECD7' },
                                { name: 'Cool', bg: '#0F172A', accent: '#3B82F6', text: '#94A3B8' },
                                { name: 'Earth', bg: '#4A5D4A', accent: '#6B8E5A', text: '#F5ECD7' },
                                { name: 'Spring', bg: '#FFE5EC', accent: '#FF8FAB', text: '#881337' },
                                { name: 'Midnight', bg: '#1A0F2E', accent: '#A78BFA', text: '#C4B5FD', border: true },
                                { name: 'Autumn', bg: '#6B2D2D', accent: '#D84315', text: '#FFF5F0' },
                                // Duplicate for loop
                                { name: 'Light', bg: '#FAF6EE', accent: '#E8783A', text: '#4B4B4B' },
                                { name: 'Dark', bg: '#000000', accent: '#EAB308', text: '#FFFFFF', border: true },
                                { name: 'Warm', bg: '#1A1A1A', accent: '#E8783A', text: '#F5ECD7' },
                                { name: 'Cool', bg: '#0F172A', accent: '#3B82F6', text: '#94A3B8' },
                                { name: 'Earth', bg: '#4A5D4A', accent: '#6B8E5A', text: '#F5ECD7' },
                                { name: 'Spring', bg: '#FFE5EC', accent: '#FF8FAB', text: '#881337' },
                                { name: 'Midnight', bg: '#1A0F2E', accent: '#A78BFA', text: '#C4B5FD', border: true },
                                { name: 'Autumn', bg: '#6B2D2D', accent: '#D84315', text: '#FFF5F0' },
                                // Third set for wide screens
                                { name: 'Light', bg: '#FAF6EE', accent: '#E8783A', text: '#4B4B4B' },
                                { name: 'Dark', bg: '#000000', accent: '#EAB308', text: '#FFFFFF', border: true },
                                { name: 'Warm', bg: '#1A1A1A', accent: '#E8783A', text: '#F5ECD7' },
                                { name: 'Cool', bg: '#0F172A', accent: '#3B82F6', text: '#94A3B8' },
                                { name: 'Earth', bg: '#4A5D4A', accent: '#6B8E5A', text: '#F5ECD7' },
                                { name: 'Spring', bg: '#FFE5EC', accent: '#FF8FAB', text: '#881337' },
                                { name: 'Midnight', bg: '#1A0F2E', accent: '#A78BFA', text: '#C4B5FD', border: true },
                                { name: 'Autumn', bg: '#6B2D2D', accent: '#D84315', text: '#FFF5F0' },
                            ].map((themeOption, i) => {
                                const isActive = mounted && theme === themeOption.name.toLowerCase()
                                return (
                                    <div
                                        key={i}
                                        className="flex flex-col gap-2 group shrink-0 w-44 cursor-pointer"
                                        onClick={() => handleThemeSelect(themeOption.name)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleThemeSelect(themeOption.name)}
                                    >
                                        <div
                                            className={`w-full aspect-[4/3] rounded-lg shadow-xl shadow-black/30 relative overflow-hidden transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-black/50 ${themeOption.border ? 'border border-white/10' : ''} ${isActive ? 'ring-2 ring-offset-2 ring-offset-[#1A1A1A] ring-white/60 scale-[1.03]' : ''}`}
                                            style={{ background: themeOption.bg }}
                                        >
                                            {/* Abstract UI Representation */}
                                            <div className="absolute left-0 top-0 bottom-0 w-10 bg-black/5 backdrop-blur-[1px]" />
                                            <div className="absolute top-3 left-0 right-0 h-px bg-black/5" />

                                            {/* Floating Active Element */}
                                            <div className="absolute right-2 bottom-2 w-5 h-5 rounded-md flex items-center justify-center shadow-md transform group-hover:-translate-y-0.5 transition-transform duration-500"
                                                style={{ background: themeOption.accent }}>
                                                <div className="w-2 h-2 rounded-sm bg-white/40" />
                                            </div>

                                            {/* Skeleton Text */}
                                            <div className="absolute left-12 top-4 w-14 h-1 rounded-full opacity-10" style={{ background: themeOption.text }} />
                                            <div className="absolute left-12 top-6 w-10 h-1 rounded-full opacity-10" style={{ background: themeOption.text }} />

                                            <div className="absolute left-12 top-10 w-20 h-1 rounded-full opacity-5" style={{ background: themeOption.text }} />
                                            <div className="absolute left-12 top-12 w-14 h-1 rounded-full opacity-5" style={{ background: themeOption.text }} />

                                            {/* Active indicator checkmark */}
                                            {isActive && (
                                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-bold text-center tracking-widest uppercase transition-opacity duration-300 ${isActive ? 'text-white opacity-100' : 'text-white/40 opacity-40 group-hover:opacity-100'}`}>
                                            {themeOption.name}
                                        </span>
                                    </div>
                                )
                            })}

                        </motion.div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pb-24 pt-0 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            title: 'Search & Organize',
                            desc: 'Find anything instantly with smart searching and powerful tags.',
                            Icon: Search,
                            img: '/images/feature-org.png',
                            gradient: 'from-[#E8783A] to-[#D9641F]',
                            delay: 0
                        },
                        {
                            title: 'AI Summaries',
                            desc: 'Turn messy meeting notes into actionable insights instantly.',
                            Icon: Sparkles,
                            img: '/images/feature-ai-sage.png',
                            gradient: 'from-[#ABD672] to-[#6B8E5A]',
                            delay: 0.1
                        },
                        {
                            title: 'Seamless Sync',
                            desc: 'Access your brain from any device, anywhere, anytime.',
                            Icon: Zap,
                            img: '/images/app-mockup.png',
                            gradient: 'from-[#CA8A04] to-[#F7D44C]',
                            delay: 0.2
                        },
                        {
                            title: 'Import Anything',
                            desc: 'Migrate from Evernote instantly with .enex support.',
                            Icon: FileDown,
                            img: '/images/feature-import.png',
                            gradient: 'from-[#60A5FA] to-[#3B82F6]',
                            delay: 0.3
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: feature.delay }}
                            className="hover-3d w-full h-full group"
                        >
                            {/* Card Content - First child for hover-3d effect */}
                            <div
                                className="relative h-full flex flex-col rounded-3xl bg-[#202020] border border-white/5 group-hover:border-white/10 transition-colors duration-500"
                            >
                                {/* Hover Glow */}
                                <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />

                                <div className="relative z-10 flex flex-col h-full p-8">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-linear-to-br ${feature.gradient} shadow-lg shadow-black/20 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:shadow-xl`}
                                        >
                                            <feature.Icon className="text-black/80 drop-shadow-sm transition-transform duration-500 group-hover:scale-110" size={20} strokeWidth={2.5} />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
                                    <p className="text-white/50 leading-relaxed mb-8 text-sm font-medium">{feature.desc}</p>

                                    {/* Image Container */}
                                    <div className="mt-auto relative w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-black/40 shadow-inner group-hover:border-white/10 transition-colors">
                                        <Image
                                            src={feature.img}
                                            alt={feature.title}
                                            fill
                                            className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105"
                                        />
                                        {/* Overlay to ensure text readability if desired, or nice fade */}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    </div>
                                </div>
                            </div>
                            {/* 8 empty divs for hover-3d effect zones */}
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Deep Dive / Pain Points Section */}
            <section className="relative z-10 bg-[#FAF6EE] py-24 px-6 border-t border-[#E8E0D0] overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Header with iPhone Mockup */}
                    <div className="mb-20 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-8">
                        {/* Left: Text Content */}
                        <div className="max-w-3xl lg:max-w-xl xl:max-w-2xl">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 tracking-tight leading-tight">
                                Built to fix the <br />
                                <span className="gradient-text">problems you hate.</span>
                            </h2>
                            <p className="text-[#7A7168] text-lg md:text-xl leading-relaxed">
                                We asked thousands of power users what frustrated them most about existing tools.
                                Then we built the solutions directly into the core of Notova.
                            </p>
                        </div>

                        {/* Right: iPhone Mockup */}
                        <motion.div
                            className="relative hidden md:flex items-center justify-center lg:justify-end flex-shrink-0"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {/* Glow Effect Behind Phone */}
                            <div
                                className="absolute inset-0 -m-8 opacity-50 pointer-events-none blur-[60px] rounded-full"
                                style={{
                                    background: 'radial-gradient(ellipse at center, var(--accent-primary) 0%, var(--accent-secondary) 30%, transparent 70%)'
                                }}
                            />

                            {/* iPhone Mockup */}
                            <motion.div
                                className="mockup-phone mockup-phone-lg mockup-phone-glow relative z-10"
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [6, 8, 6]
                                }}
                                transition={{
                                    duration: 4,
                                    ease: "easeInOut",
                                    repeat: Infinity
                                }}
                                style={{ transform: 'rotate(6deg)' }}
                            >
                                <div className="mockup-phone-camera"></div>
                                <div className="mockup-phone-display">
                                    {/* Video playing inside the phone - using img for webp animation */}
                                    <img
                                        src="/mockups/dashboard_mobile_demo.webp"
                                        alt="Notova Dashboard Demo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </motion.div>

                            {/* Floating decorative elements */}
                            <motion.div
                                className="absolute -top-6 -left-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                                animate={{
                                    y: [0, -8, 0],
                                    rotate: [0, 10, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                            >
                                <Sparkles size={20} className="text-white" />
                            </motion.div>

                            <motion.div
                                className="absolute -bottom-4 -right-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-[#3B82F6]"
                                animate={{
                                    y: [0, 8, 0],
                                    rotate: [0, -10, 0]
                                }}
                                transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                            >
                                <Zap size={16} className="text-white" />
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">

                        {/* 1. Import Feature - Col Span 7 (Large) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-7 h-[400px] group relative rounded-3xl bg-white border border-[#E8E0D0] overflow-hidden hover:border-[#F7D44C]/30 transition-all duration-500 shadow-xl shadow-[#1E140A]/5"
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-[#F7D44C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Import Visual */}
                            <div className="w-full h-full absolute right-[-20%] bottom-[-20%] opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0">
                                {/* CSS File Stack */}
                                <div className="relative w-64 h-80 transform rotate-12 translate-y-12">
                                    <div className="absolute inset-0 bg-[#F5F0E6] border border-[#E8E0D0] rounded-xl transform -rotate-6 translate-x-4 shadow-xl" />
                                    <div className="absolute inset-0 bg-[#FAF6EE] border border-[#E8E0D0] rounded-xl transform -rotate-3 translate-x-2 shadow-xl" />
                                    <div className="absolute inset-0 bg-white border border-[#F7D44C]/30 rounded-xl shadow-2xl flex flex-col p-6 space-y-4">
                                        <div className="h-4 w-1/3 bg-[#F7D44C]/20 rounded-full" />
                                        <div className="h-2 w-full bg-[#1A1A1A]/5 rounded-full" />
                                        <div className="h-2 w-5/6 bg-[#1A1A1A]/5 rounded-full" />
                                        <div className="h-2 w-4/6 bg-[#1A1A1A]/5 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 p-10 h-full flex flex-col items-start justify-between">
                                <div className="space-y-4 max-w-md">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7D44C]/10 text-[#D97706] text-xs font-bold uppercase tracking-wider">
                                        <FileDown size={14} />
                                        <span>Migration</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-[#1A1A1A]">Left behind? Never.</h3>
                                    <p className="text-[#7A7168] text-lg">
                                        Import your entire <strong>.enex</strong> library in seconds.
                                        All your tags, dates, and formatting are preserved perfectly.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. AI Feature - Col Span 5 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-5 h-[400px] group relative rounded-3xl bg-white border border-[#E8E0D0] overflow-hidden hover:border-[#7a9a65]/30 transition-all duration-500 shadow-xl shadow-[#1E140A]/5"
                        >
                            <div className="absolute inset-0 bg-linear-to-bl from-[#7a9a65]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* AI Visual */}
                            <div className="w-full h-full absolute right-[-10%] bottom-[-10%] opacity-20 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                                <div className="relative w-full h-full transform flex items-center justify-center translate-y-12 translate-x-12">
                                    <div className="absolute w-48 h-64 bg-[#7a9a65]/5 border border-[#7a9a65]/20 rounded-2xl transform rotate-12 translate-x-8" />
                                    <div className="absolute w-48 h-64 bg-[#7a9a65]/10 border border-[#7a9a65]/20 rounded-2xl transform rotate-6 translate-x-4" />
                                    <div className="absolute w-48 h-64 bg-white border border-[#7a9a65]/30 rounded-2xl shadow-2xl flex flex-col p-6 space-y-3 transform -rotate-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-[#7a9a65]" />
                                            <div className="h-2 w-16 bg-[#1A1A1A]/5 rounded-full" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-[#1A1A1A]/5 rounded-full" />
                                            <div className="h-2 w-5/6 bg-[#1A1A1A]/5 rounded-full" />
                                            <div className="h-2 w-4/6 bg-[#1A1A1A]/5 rounded-full opacity-50" />
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-[#1A1A1A]/5">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={12} className="text-[#7a9a65]" />
                                                <div className="h-2 w-20 bg-[#7a9a65]/20 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 p-10 h-full flex flex-col">
                                <div className="inline-flex content-center self-start items-center gap-2 px-3 py-1 rounded-full bg-[#7a9a65]/10 text-[#7a9a65] text-xs font-bold uppercase tracking-wider mb-4">
                                    <Brain size={14} />
                                    <span>Intelligence</span>
                                </div>
                                <h3 className="text-3xl font-bold text-[#1A1A1A] mb-4">Read less. Know more.</h3>
                                <p className="text-[#7A7168] text-lg mb-8">
                                    Our AI reads your messy meeting notes and instantly extracts action items and summaries.
                                </p>

                                <div className="mt-auto bg-white/60 rounded-xl border border-[#E8E0D0] p-4 backdrop-blur-sm self-end w-full transform group-hover:translate-y-0 translate-y-2 transition-transform shadow-sm">
                                    <div className="flex items-center gap-3 mb-2 text-[#7a9a65]">
                                        <Sparkles size={16} />
                                        <span className="text-xs font-bold uppercase">AI Summary Generated</span>
                                    </div>
                                    <p className="text-[#7A7168] text-sm leading-relaxed line-clamp-2">
                                        • Launch Q3 marketing campaign <br />
                                        • Update diverse icon set for deployment
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Smart Search & Filters - Full Width Bottom */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-12 min-h-[300px] group relative rounded-3xl bg-white border border-[#E8E0D0] overflow-hidden hover:border-[#3B82F6]/30 transition-all duration-500 shadow-xl shadow-[#1E140A]/5 flex flex-col md:flex-row items-center"
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-10 md:w-1/2 flex flex-col justify-center relative z-10">
                                <div className="inline-flex content-center self-start items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-bold uppercase tracking-wider mb-4">
                                    <Search size={14} />
                                    <span>Discovery</span>
                                </div>
                                <h3 className="text-3xl font-bold text-[#1A1A1A] mb-4">Stop searching. Start finding.</h3>
                                <p className="text-[#7A7168] text-lg">
                                    Advanced filtering lets you combine tags, dates, and even color-coded categories.
                                    It's the most powerful search engine for your personal knowledge.
                                </p>
                            </div>

                            <div className="relative md:w-1/2 h-full flex items-center justify-center p-8 bg-[#FAF6EE]/50 w-full">
                                {/* Search Interface Graphic */}
                                <div className="w-full max-w-md bg-white rounded-xl border border-[#E8E0D0] shadow-2xl p-4 flex flex-col gap-3 transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="flex items-center gap-3 bg-[#FAF6EE] rounded-lg px-4 py-3 border border-[#E8E0D0]">
                                        <Search size={18} className="text-[#7A7168]/60" />
                                        <span className="text-[#7A7168]/60 text-sm">project launch</span>
                                        <div className="ml-auto flex gap-2">
                                            <span className="px-2 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-bold border border-[#3B82F6]/20">#Q3</span>
                                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">DOC</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-2 w-16 bg-[#1A1A1A]/5 rounded-full" />
                                        <div className="h-2 w-24 bg-[#1A1A1A]/5 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Final Call to Action */}
            <section className="relative z-10 py-24 px-6 overflow-hidden bg-[#1A1A1A]">
                {/* Background Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-40"
                        style={{ background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)' }} />
                </div>

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                            Your best ideas <br />
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' }}>
                                deserve a home.
                            </span>
                        </h2>
                        <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Experience the focus, clarity, and beauty of Notova today.
                            Join the new standard of thoughtful organization.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <Link href="/signup"
                                className="group px-8 py-4 rounded-full font-bold text-[#1A1A1A] text-lg shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' }}
                            >
                                Get Started Free
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <a href="mailto:contact@notova.app"
                                className="px-8 py-4 rounded-full font-bold text-white text-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center gap-3 backdrop-blur-sm"
                            >
                                <Mail size={20} className="text-[#E8783A]" />
                                Questions?
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1A1A1A] py-8 border-t border-white/5 relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#7A7168] text-sm">
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
