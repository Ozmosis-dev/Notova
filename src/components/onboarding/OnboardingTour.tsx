'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, PenTool, Sparkles, Rocket, Zap } from 'lucide-react';

interface Step {
    id: string;
    title: string;
    description: string;
    image?: React.ReactNode;
    targetId?: string; // ID of element to highlight
    showSkip?: boolean;
}

const steps: Step[] = [
    {
        id: 'welcome',
        title: 'Welcome to Notova',
        description: 'Your modern, AI-powered workspace for capturing and organizing ideas. Let\'s take a quick tour.',
        image: <Zap size={48} />
    },
    {
        id: 'notebooks',
        title: 'Organize with Notebooks',
        description: 'Create notebooks to keep your projects and ideas separate. You can customize them with icons and colors.',
        targetId: 'notebooks-sidebar',
        image: <Book size={48} />
    },
    {
        id: 'notes',
        title: 'Capture Everything',
        description: 'Write distraction-free notes. Use the "+" button to create a new note instantly.',
        image: <PenTool size={48} />
    },
    {
        id: 'ai',
        title: 'AI Superpowers',
        description: 'Use the AI features to summarize notes, generate tags, and find connections between your ideas.',
        image: <Sparkles size={48} />
    },
    {
        id: 'ready',
        title: 'You\'re All Set',
        description: 'Start capturing your ideas now. We hope you enjoy using Notova!',
        image: <Rocket size={48} />
    }
];

export function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hasMounted, setHasMounted] = useState(false);


    useEffect(() => {
        setHasMounted(true);
        // Check if onboarding has been completed
        const hasCompletedOnboarding = localStorage.getItem('notova_onboarding_completed');
        if (!hasCompletedOnboarding) {
            // Small delay to allow app to load
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, []);



    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setIsOpen(false);
        localStorage.setItem('notova_onboarding_completed', 'true');
    };

    if (!hasMounted) return null;

    const currentStep = steps[currentStepIndex];


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-[var(--surface-content)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden relative"
                    >
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--surface-content-secondary)]">
                            <motion.div
                                className="h-full bg-[var(--accent-primary)]"
                                initial={{ width: '0%' }}
                                animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleComplete}
                            className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--surface-content-secondary)]"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-8 pb-6 flex flex-col items-center text-center">
                            <motion.div
                                key={`image-${currentStep?.id}`}
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="mb-6 w-24 h-24 flex items-center justify-center bg-[var(--accent-glow-soft)] text-[var(--accent-primary)] rounded-full"
                            >
                                {currentStep?.image}
                            </motion.div>

                            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
                                {steps[currentStepIndex]?.title}
                            </h3>
                            <p className="text-[var(--text-secondary)] mb-6">
                                {steps[currentStepIndex]?.description}
                            </p>

                            <div className="w-full flex items-center justify-between mt-auto">
                                <div className="flex gap-1">
                                    {steps.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentStepIndex ? 'bg-[var(--accent-primary)]' : 'bg-[var(--surface-content-tertiary)]'}`}
                                        />
                                    ))}
                                </div>

                                {steps[currentStepIndex]?.showSkip && (
                                    <button
                                        onClick={handleComplete}
                                        className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-content-secondary)] transition-colors"
                                    >
                                        Skip Tour
                                    </button>
                                )}

                                <button
                                    onClick={handleNext}
                                    className="px-6 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] transition-colors ml-auto shadow-sm"
                                >
                                    {currentStepIndex === steps.length - 1 ? 'Get Started' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
