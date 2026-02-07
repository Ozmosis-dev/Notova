'use client'


import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
}

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-[#1A1A1A] text-[#E8E0D0]" style={{ fontFamily: 'var(--font-lufga), system-ui, -apple-system, sans-serif' }}>
            {/* Header */}
            <header className="border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
                    <Link href="/login" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Notova</span>
                    </Link>
                    {/* Brand Icon */}
                    <Link href="/login" className="w-7 h-7 block">
                        <svg viewBox="0 0 240 282.3" className="w-full h-full">
                            <defs>
                                <linearGradient id="cookiesIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--accent-primary)" />
                                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#cookiesIconGradient)" d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                            <path fill="url(#cookiesIconGradient)" d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
                        </svg>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <motion.div {...fadeIn}>
                    {/* Page Title */}
                    <div className="mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Cookie Policy
                        </h1>
                        <p className="text-[#7A7168] text-base">
                            Last updated: February 7, 2026
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-12 text-[#B0A898] leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. What Are Cookies</h2>
                            <p>
                                Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide reporting information. Cookies set by the website owner (in this case, Notova) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies."
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Cookies</h2>
                            <p>
                                Notova uses cookies and similar technologies to enhance your experience, understand how you use our Service, and personalize your settings. Below is a breakdown of the types of cookies we use.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Types of Cookies We Use</h2>

                            {/* Cookie type cards */}
                            <div className="space-y-6 mt-6">
                                <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                                        <h3 className="text-lg font-medium text-white">Essential Cookies</h3>
                                    </div>
                                    <p>
                                        These cookies are strictly necessary for the Service to function. They enable core features like user authentication, session management, and security protection. Without these cookies, the Service cannot operate properly. These cookies do not store any personally identifiable information beyond what is needed for authentication.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Authentication</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Session</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Security</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                                        <h3 className="text-lg font-medium text-white">Analytics Cookies</h3>
                                    </div>
                                    <p>
                                        These cookies help us understand how visitors interact with our Service by collecting and reporting information anonymously. We use this data to improve our product, identify popular features, and optimize performance. Analytics data is aggregated and does not identify individual users.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">Page views</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">Feature usage</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">Performance</span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                                        <h3 className="text-lg font-medium text-white">Preference Cookies</h3>
                                    </div>
                                    <p>
                                        These cookies allow the Service to remember choices you make, such as your preferred theme, language, editor settings, and display preferences. They provide a more personalized experience and save you from having to reconfigure settings on each visit.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', color: 'var(--accent-primary)', borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }}>Theme</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', color: 'var(--accent-primary)', borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }}>Language</span>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', color: 'var(--accent-primary)', borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }}>Editor settings</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Managing Cookies</h2>
                            <p className="mb-4">
                                You can control and manage cookies in several ways. Please note that removing or blocking cookies may impact your experience and parts of the Service may no longer be fully functional.
                            </p>
                            <ul className="list-disc list-inside space-y-3 ml-2">
                                <li><strong className="text-white/90">Browser settings:</strong> Most browsers allow you to view, manage, delete, and block cookies. Be aware that deleting cookies will remove any preferences you have set.</li>
                                <li><strong className="text-white/90">Device settings:</strong> Your mobile device may allow you to control cookies through its settings function.</li>
                                <li><strong className="text-white/90">Opt-out tools:</strong> Some analytics providers offer their own opt-out tools (e.g., Google Analytics opt-out browser add-on).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Cookies</h2>
                            <p>
                                In some cases, we use trusted third-party services that may also set cookies on your device. These third parties include analytics providers and cloud infrastructure services. Third-party cookies are governed by the respective third party's privacy policy, not this Cookie Policy. We carefully vet all third-party services to ensure they meet our privacy standards.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Updates to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies. The "Last updated" date at the top of this page indicates when this policy was last revised.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Contact Us</h2>
                            <p>
                                If you have any questions about our use of cookies, please contact us at{' '}
                                <a href="mailto:privacy@notova.app" className="underline decoration-1 underline-offset-4 hover:text-white transition-colors" style={{ color: 'var(--accent-primary)' }}>
                                    privacy@notova.app
                                </a>.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#7A7168] text-sm">
                    <p>© 2026 Notova Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <span className="text-white/80 font-medium cursor-default">Cookies</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
