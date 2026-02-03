'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';

interface AddToHomeScreenModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps = [
    {
        title: "Tap the Share Button",
        description: "Look for the share icon in your browser's navigation bar.",
        icon: (
            <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
        )
    },
    {
        title: "Add to Home Screen",
        description: "Scroll down the list and tap 'Add to Home Screen'.",
        icon: (
            <svg className="w-12 h-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m-3-3h6" />
            </svg>
        )
    },
    {
        title: "Confirm to Install",
        description: "Tap 'Add' in the top right corner to finish installing.",
        icon: (
            <div className="flex flex-col items-center">
                <span className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-primary)' }}>Add</span>
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        )
    }
];

export function AddToHomeScreenModal({ isOpen, onClose }: AddToHomeScreenModalProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Install App" size="sm">
            <div className="text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="py-6 flex flex-col items-center"
                    >
                        <div
                            className="p-4 rounded-2xl mb-4 transition-colors"
                            style={{ background: 'var(--surface-shell)' }}
                        >
                            <div style={{ color: 'var(--accent-primary)' }}>
                                {steps[currentStep].icon}
                            </div>
                        </div>
                        <h3
                            className="text-lg font-semibold mb-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {steps[currentStep].title}
                        </h3>
                        <p
                            className="text-sm px-4"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {steps[currentStep].description}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mb-6">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className="w-2 h-2 rounded-full transition-colors"
                            style={{
                                background: index === currentStep
                                    ? 'var(--accent-primary)'
                                    : 'var(--border-primary)'
                            }}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-between">
                    <button
                        onClick={handlePrev}
                        className={`px-4 py-2 text-sm font-medium transition-opacity ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
                        style={{
                            background: 'var(--accent-primary)',
                            color: 'white'
                        }}
                    >
                        {currentStep === steps.length - 1 ? 'Got it' : 'Next'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
