'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', isLoading = false, disabled, children, style, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        // Define styles using CSS variables for theme consistency
        const getVariantStyles = () => {
            switch (variant) {
                case 'primary':
                    return {
                        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                        color: 'var(--text-on-accent)',
                        boxShadow: 'var(--shadow-sm)',
                    };
                case 'secondary':
                    return {
                        background: 'var(--surface-content-secondary)',
                        color: 'var(--text-primary)',
                    };
                case 'ghost':
                    return {
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                    };
                case 'danger':
                    return {
                        background: '#DC2626',
                        color: '#FFFFFF',
                    };
                default:
                    return {};
            }
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm gap-1.5',
            md: 'px-4 py-2.5 text-sm gap-2',
            lg: 'px-6 py-3 text-base gap-2',
        };

        const variantClasses = {
            primary: 'hover:opacity-90 focus:ring-amber-400',
            secondary: 'hover:brightness-95 focus:ring-amber-300',
            ghost: 'hover:bg-[var(--surface-content-secondary)] focus:ring-amber-300',
            danger: 'hover:bg-red-700 focus:ring-red-500',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantClasses[variant]} ${sizes[size]} ${className}`}
                style={{
                    ...getVariantStyles(),
                    transition: 'var(--transition-fast)',
                    ...style,
                }}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
