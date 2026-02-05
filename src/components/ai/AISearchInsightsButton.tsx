'use client';

import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import '@/styles/ai.css';

interface AISearchInsightsButtonProps {
    onClick: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    matchCount: number;
    className?: string;
}

export function AISearchInsightsButton({
    onClick,
    isLoading = false,
    disabled = false,
    matchCount,
    className = '',
}: AISearchInsightsButtonProps) {
    // Only show when there are 2+ matches
    if (matchCount < 2) {
        return null;
    }

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoading && !disabled) {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading || disabled}
            className={`ai-insights-button ${className}`}
            title={`Get AI insights from ${matchCount} matching notes`}
        >
            {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <Sparkles size={14} />
            )}
            <span className="hidden sm:inline">Summarize</span>
        </button>
    );
}

export default AISearchInsightsButton;
