'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, helperText, id, style, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
        const [isFocused, setIsFocused] = useState(false);

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block font-medium mb-2"
                        style={{
                            fontSize: 'var(--font-small)',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
                        w-full px-4 py-3 rounded-xl transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${className}
                    `}
                    style={{
                        fontSize: 'var(--font-body)',
                        background: 'var(--surface-content)',
                        color: 'var(--text-primary)',
                        border: error
                            ? '2px solid #DC2626'
                            : isFocused
                                ? '2px solid var(--accent-primary)'
                                : '1px solid var(--border-primary)',
                        outline: 'none',
                        boxShadow: isFocused ? '0 0 0 3px var(--highlight-soft)' : 'none',
                        transition: 'var(--transition-fast)',
                        ...style,
                    }}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />
                {error && (
                    <p
                        className="mt-2"
                        style={{
                            fontSize: 'var(--font-small)',
                            color: '#DC2626',
                        }}
                    >
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p
                        className="mt-2"
                        style={{
                            fontSize: 'var(--font-small)',
                            color: 'var(--text-muted)',
                        }}
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
