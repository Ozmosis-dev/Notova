'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon | ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ''
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px] ${className}`}
        >
            <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{
                    background: 'var(--surface-content-secondary)',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                {Icon && (
                    // Render icon appropriately
                    typeof Icon === 'function' ? (
                        <Icon size={40} style={{ color: 'var(--text-muted)' }} />
                    ) : (
                        <div className="text-[var(--text-muted)] scale-150">{Icon}</div>
                    )
                )}
            </div>

            <h3
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
            >
                {title}
            </h3>

            <p
                className="text-sm max-w-xs mb-8"
                style={{ color: 'var(--text-secondary)' }}
            >
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    className="px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                        color: 'var(--text-on-accent)',
                        boxShadow: 'var(--shadow-md)'
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
}
