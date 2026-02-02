'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail?: string;
    userId?: string;
}

type IssueCategory = 'bug' | 'feature' | 'other';

// SVG Icons for categories
const BugIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12v.01M12 2a2.5 2.5 0 00-2.5 2.5c0 .394.09.767.252 1.1L8.5 7H6a2 2 0 00-2 2v1.5m0 0V12m0-1.5h2m14-1.5a2 2 0 00-2-2h-2.5l-1.252-1.4A2.498 2.498 0 0012 2M4 12v5a7 7 0 0014 0v-5M4 12h2m14 0h-2m0 0V10.5M6 12v.01M18 12v.01M8 16h.01M16 16h.01" />
    </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);

const ChatBubbleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const categoryConfig: Record<IssueCategory, { label: string; icon: React.FC<{ className?: string }>; description: string }> = {
    bug: {
        label: 'Bug Report',
        icon: BugIcon,
        description: 'Something isn\'t working correctly',
    },
    feature: {
        label: 'Feature Request',
        icon: SparklesIcon,
        description: 'Suggest an improvement or new feature',
    },
    other: {
        label: 'Other Feedback',
        icon: ChatBubbleIcon,
        description: 'General feedback or questions',
    },
};

export function ReportIssueModal({ isOpen, onClose, userEmail, userId }: ReportIssueModalProps) {
    const [category, setCategory] = useState<IssueCategory>('bug');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        if (!description.trim()) {
            setErrorMessage('Please describe the issue');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch('/api/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail: userEmail || 'anonymous@notova.app',
                    userId,
                    category,
                    description: description.trim(),
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit report');
            }

            setSubmitStatus('success');

            // Reset and close after showing success
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting issue:', error);
            setSubmitStatus('error');
            setErrorMessage('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        // Reset state
        setCategory('bug');
        setDescription('');
        setSubmitStatus('idle');
        setErrorMessage('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Report an Issue" size="md">
            <AnimatePresence mode="wait">
                {submitStatus === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-8"
                    >
                        <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--status-success)', opacity: 0.1 }}
                        >
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="var(--status-success)"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3
                            className="text-lg font-semibold mb-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Thank you!
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Your feedback has been submitted successfully.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Category Selection */}
                        <div className="mb-5">
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Category
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(categoryConfig) as IssueCategory[]).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className="p-3 rounded-xl text-center transition-all"
                                        style={{
                                            background: category === cat
                                                ? 'var(--accent-primary)'
                                                : 'var(--surface-content-secondary)',
                                            color: category === cat
                                                ? 'white'
                                                : 'var(--text-primary)',
                                            border: `2px solid ${category === cat ? 'var(--accent-primary)' : 'transparent'}`,
                                        }}
                                    >
                                        {(() => {
                                            const IconComponent = categoryConfig[cat].icon;
                                            return <IconComponent className="w-6 h-6 mx-auto mb-1" />;
                                        })()}
                                        <span className="text-xs font-medium">{categoryConfig[cat].label}</span>
                                    </button>
                                ))}
                            </div>
                            <p
                                className="text-xs mt-2"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {categoryConfig[category].description}
                            </p>
                        </div>

                        {/* Description */}
                        <div className="mb-5">
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={
                                    category === 'bug'
                                        ? 'Please describe what happened and what you expected to happen...'
                                        : category === 'feature'
                                            ? 'Describe the feature you\'d like to see...'
                                            : 'Share your feedback or questions...'
                                }
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl resize-none transition-colors"
                                style={{
                                    background: 'var(--surface-content-secondary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-primary)',
                                    outline: 'none',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--accent-primary)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-primary)';
                                }}
                            />
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm mb-4 px-3 py-2 rounded-lg"
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--status-error)',
                                }}
                            >
                                {errorMessage}
                            </motion.p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                style={{
                                    background: 'var(--surface-content-secondary)',
                                    color: 'var(--text-primary)',
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !description.trim()}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                                style={{
                                    background: isSubmitting
                                        ? 'var(--surface-content-secondary)'
                                        : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                    color: isSubmitting ? 'var(--text-muted)' : 'white',
                                    opacity: !description.trim() ? 0.6 : 1,
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="w-4 h-4 animate-spin"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                            />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                            />
                                        </svg>
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
}
