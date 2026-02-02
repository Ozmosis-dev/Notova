'use client';

import { Fragment, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    if (!mounted || !isOpen) return null;

    return createPortal(
        <Fragment>
            {/* Backdrop with warm overlay */}
            <div
                className="fixed inset-0 z-50 transition-opacity"
                style={{
                    background: 'rgba(26, 26, 26, 0.6)',
                    backdropFilter: 'blur(4px)',
                }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div
                        className={`relative w-full ${sizes[size]} rounded-2xl shadow-2xl transform transition-all`}
                        style={{
                            background: 'var(--surface-content)',
                            border: '1px solid var(--border-primary)',
                            boxShadow: 'var(--shadow-xl)',
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? 'modal-title' : undefined}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        {title && (
                            <div
                                className="flex items-center justify-between px-6 py-4"
                                style={{ borderBottom: '1px solid var(--border-primary)' }}
                            >
                                <h2
                                    id="modal-title"
                                    className="font-semibold"
                                    style={{
                                        fontSize: 'var(--font-subheading)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl transition-colors"
                                    style={{
                                        color: 'var(--text-muted)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--surface-content-secondary)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                    }}
                                    aria-label="Close modal"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="px-6 py-5">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>,
        document.body
    );
}
