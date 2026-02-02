import Image from 'next/image';

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
            <Image
                src="/4star.svg"
                alt=""
                width={pixelSize}
                height={pixelSize}
                className="animate-spin"
                style={{
                    filter: 'brightness(0) saturate(100%) invert(53%) sepia(82%) saturate(680%) hue-rotate(346deg) brightness(95%) contrast(91%)',
                }}
            />
        </div>
    );
}
