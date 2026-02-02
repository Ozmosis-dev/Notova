'use client';

import { useCallback } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import '@/styles/ai.css';

interface AISummarizeButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'compact' | 'icon';
    className?: string;
}

export function AISummarizeButton({
    onClick,
    isLoading = false,
    disabled = false,
    variant = 'default',
    className = '',
}: AISummarizeButtonProps) {
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading && !disabled) {
            onClick();
        }
    }, [onClick, isLoading, disabled]);

    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                disabled={isLoading || disabled}
                className={`ai-summarize-button ${isLoading ? 'loading' : ''} ${className}`}
                style={{ padding: '8px', borderRadius: '8px' }}
                title="Summarize with AI"
                aria-label="Summarize with AI"
            >
                {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Sparkles size={18} />
                )}
            </button>
        );
    }

    if (variant === 'compact') {
        return (
            <button
                onClick={handleClick}
                disabled={isLoading || disabled}
                className={`ai-summarize-button ${isLoading ? 'loading' : ''} ${className}`}
                style={{ padding: '6px 10px', fontSize: '12px' }}
            >
                {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Sparkles size={14} />
                )}
                <span>Summarize</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || disabled}
            className={`ai-summarize-button ${isLoading ? 'loading' : ''} ${className}`}
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Sparkles size={16} />
            )}
            <span>AI Summarize</span>
        </button>
    );
}

export default AISummarizeButton;
