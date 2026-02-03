import { motion } from 'framer-motion';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
    };

    const pixelSize = sizes[size];

    return (
        <div
            className={`inline-flex items-center justify-center ${className}`}
            role="status"
            aria-label="Loading"
        >
            <motion.svg
                width={pixelSize}
                height={pixelSize}
                viewBox="0 0 97.6 96.4"
                className="animate-spin"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            >
                <defs>
                    <linearGradient id={`spinnerGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'var(--accent-primary)' }} />
                        <stop offset="100%" style={{ stopColor: 'var(--accent-secondary)' }} />
                    </linearGradient>
                </defs>
                <path
                    d="M48.2.5c6.6,26.1,21.7,42.6,48.9,48,.6.1.6,1,0,1.2-25,6.6-41.9,20.5-48.2,46.3-.2.6-1.1.6-1.2,0C41.6,70.5,26.6,55.2.5,50c-.7-.1-.7-1.1,0-1.2C26.4,42.6,41.8,27,47,.5c.1-.6,1-.7,1.2,0Z"
                    fill={`url(#spinnerGradient-${size})`}
                    strokeWidth="0"
                />
            </motion.svg>
        </div>
    );
}
