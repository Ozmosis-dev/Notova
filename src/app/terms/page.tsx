'use client'


import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
}

export default function TermsPage() {
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
                                <linearGradient id="termsIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--accent-primary)" />
                                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#termsIconGradient)" d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                            <path fill="url(#termsIconGradient)" d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
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
                            Terms of Service
                        </h1>
                        <p className="text-[#7A7168] text-base">
                            Last updated: February 7, 2026
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-12 text-[#B0A898] leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using Notova ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and your continued use of the Service after changes constitutes acceptance of the updated terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
                            <p>
                                Notova is a modern note-taking and knowledge management platform that allows users to create, organize, and sync notes across devices. The Service includes features such as AI-powered summaries, smart search, file imports, and customizable themes. We may add, modify, or discontinue features at our discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Account Terms</h2>
                            <ul className="list-disc list-inside space-y-3 ml-2">
                                <li>You must be at least 13 years of age to use the Service.</li>
                                <li>You are responsible for maintaining the security of your account and password.</li>
                                <li>You are responsible for all content posted and activity that occurs under your account.</li>
                                <li>You must provide accurate and complete registration information.</li>
                                <li>One person or legal entity may not maintain more than one account.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Acceptable Use</h2>
                            <p className="mb-4">You agree not to use the Service to:</p>
                            <ul className="list-disc list-inside space-y-3 ml-2">
                                <li>Violate any applicable laws or regulations.</li>
                                <li>Upload or transmit viruses, malware, or other malicious code.</li>
                                <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
                                <li>Harass, abuse, or harm another person or entity.</li>
                                <li>Infringe upon any third-party intellectual property rights.</li>
                                <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Your Content</h2>
                            <p>
                                You retain ownership of all content that you create, upload, or store using the Service ("Your Content"). By using the Service, you grant Notova a limited license to store, process, and display Your Content solely for the purpose of providing and improving the Service. We will not sell, share, or use Your Content for advertising purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property</h2>
                            <p>
                                The Service and its original content, features, and functionality are owned by Notova Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without prior written consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Termination</h2>
                            <p>
                                We may terminate or suspend your account immediately, without prior notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion. Upon termination, your right to use the Service will cease immediately. You may export your data prior to termination.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
                            <p>
                                The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, secure, or error-free.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, Notova Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">10. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located within the United States.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
                            <p>
                                If you have any questions about these Terms, please contact us at{' '}
                                <a href="mailto:legal@notova.app" className="underline decoration-1 underline-offset-4 hover:text-white transition-colors" style={{ color: 'var(--accent-primary)' }}>
                                    legal@notova.app
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
                        <span className="text-white/80 font-medium cursor-default">Terms</span>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
