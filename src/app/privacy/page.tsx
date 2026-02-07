'use client'


import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
}

export default function PrivacyPage() {
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
                                <linearGradient id="privacyIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--accent-primary)" />
                                    <stop offset="100%" stopColor="var(--accent-secondary)" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#privacyIconGradient)" d="M190.8,20.9l-23.8.2c-14.5,0-28.4,5.6-39,15.5l-93.5,98.1c-11.4,10.7-18,25.6-18.3,41.2l-.9,58.6c0,26.3,22.1,47.8,49.2,47.8h126.3c27.1,0,49.2-21.4,49.2-47.8V68.6c0-26.3-22.1-47.8-49.2-47.8ZM135.1,60.2c-14.5,13.6-17.4,33.4-17.4,51.1v16.2c0,4-3.5,7.2-7.8,7.2h-5.8c-19.2,0-40.6,2.3-55.4,15.6l86.4-90ZM220.3,234.5c0,15.5-13.2,28.1-29.5,28.1h-126.3c-16.3,0-29.5-12.6-29.5-28.1v-40.5s0,0,0,0v13.9c0-40.5,36.6-55.3,61.4-55.3h29.5c8.3,0,15-6.2,15-13.8v-30.7c0-41,25-67.3,49.3-67.3h4.5c14.4,1.8,25.6,13.6,25.6,27.8v165.9Z" />
                            <path fill="url(#privacyIconGradient)" d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z" />
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
                            Privacy Policy
                        </h1>
                        <p className="text-[#7A7168] text-base">
                            Last updated: February 7, 2026
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-12 text-[#B0A898] leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
                            <p>
                                At Notova ("we," "us," or "our"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our note-taking and knowledge management platform. Please read this policy carefully. By using the Service, you consent to the practices described herein.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
                            <h3 className="text-lg font-medium text-white/80 mb-3 mt-6">Account Information</h3>
                            <p className="mb-4">
                                When you create an account, we collect your email address and password (stored in encrypted form). We may also collect your display name and profile preferences.
                            </p>

                            <h3 className="text-lg font-medium text-white/80 mb-3 mt-6">Content Data</h3>
                            <p className="mb-4">
                                We store the notes, notebooks, tags, and any files you upload to the Service. This content is encrypted at rest and in transit to protect your privacy.
                            </p>

                            <h3 className="text-lg font-medium text-white/80 mb-3 mt-6">Usage Data</h3>
                            <p>
                                We automatically collect certain information about how you interact with the Service, including device type, browser type, operating system, IP address, pages visited, and features used. This data helps us improve the Service and troubleshoot issues.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                            <ul className="list-disc list-inside space-y-3 ml-2">
                                <li>To provide, maintain, and improve the Service.</li>
                                <li>To process and complete transactions, and send related information.</li>
                                <li>To send technical notices, updates, security alerts, and support messages.</li>
                                <li>To respond to your comments, questions, and customer service requests.</li>
                                <li>To generate AI-powered summaries and insights from your notes (processed securely and not shared).</li>
                                <li>To monitor and analyze usage trends to improve user experience.</li>
                                <li>To detect, prevent, and address technical issues and security threats.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Data Sharing</h2>
                            <p className="mb-4">
                                We do not sell, trade, or rent your personal information or content to third parties. We may share limited information in the following circumstances:
                            </p>
                            <ul className="list-disc list-inside space-y-3 ml-2">
                                <li><strong className="text-white/90">Service providers:</strong> With trusted third-party vendors who assist in operating the Service (e.g., cloud hosting, analytics), bound by confidentiality agreements.</li>
                                <li><strong className="text-white/90">Legal compliance:</strong> When required by law, subpoena, or governmental request.</li>
                                <li><strong className="text-white/90">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with notice to affected users.</li>
                                <li><strong className="text-white/90">Consent:</strong> With your explicit consent for any other purpose.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
                            <p>
                                We implement industry-standard security measures to protect your data, including AES-256 encryption at rest, TLS 1.3 encryption in transit, and regular security audits. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Data Retention</h2>
                            <p>
                                We retain your personal data and content for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete or anonymize your data within 30 days, except where we are required to retain it for legal or regulatory purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">7. Your Rights</h2>
                            <p className="mb-4">Depending on your jurisdiction, you may have the following rights:</p>
                            <ul className="list-disc list-inside space-y-3 ml-2">
                                <li><strong className="text-white/90">Access:</strong> Request a copy of the personal data we hold about you.</li>
                                <li><strong className="text-white/90">Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                                <li><strong className="text-white/90">Deletion:</strong> Request deletion of your personal data.</li>
                                <li><strong className="text-white/90">Portability:</strong> Export your notes and data in standard formats.</li>
                                <li><strong className="text-white/90">Objection:</strong> Object to certain types of processing of your data.</li>
                                <li><strong className="text-white/90">Withdrawal of consent:</strong> Withdraw consent for data processing at any time.</li>
                            </ul>
                            <p className="mt-4">
                                To exercise any of these rights, please contact us at{' '}
                                <a href="mailto:privacy@notova.app" className="underline decoration-1 underline-offset-4 hover:text-white transition-colors" style={{ color: 'var(--accent-primary)' }}>
                                    privacy@notova.app
                                </a>.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">8. Children's Privacy</h2>
                            <p>
                                The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete such information promptly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">9. International Data Transfers</h2>
                            <p>
                                Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place for such transfers, including Standard Contractual Clauses and other legally recognized mechanisms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the revised policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
                            <p>
                                If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
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
                        <span className="text-white/80 font-medium cursor-default">Privacy</span>
                        <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
