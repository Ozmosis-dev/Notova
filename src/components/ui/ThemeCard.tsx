import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import React, { useRef } from "react";

interface ThemeOption {
    name: string;
    bg: string;
    accent: string;
    text: string;
    border?: boolean;
}

interface ThemeCardProps {
    theme: ThemeOption;
    isActive: boolean;
    onClick: () => void;
    compact?: boolean;
}

export const ThemeCard = ({ theme, isActive, onClick, compact = false }: ThemeCardProps) => {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse position values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring animation for tilt - reduced stiffness/damping for 'weight'
    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    // Calculate rotation - subtle
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

    // Spotlight Effect values
    const spotX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    const spotY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
    const spotlight = useMotionTemplate`radial-gradient(150px circle at ${spotX} ${spotY}, rgba(255,255,255,0.2), transparent 80%)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseXRel = e.clientX - rect.left;
        const mouseYRel = e.clientY - rect.top;

        const xPct = mouseXRel / width - 0.5;
        const yPct = mouseYRel / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                perspective: 800, // Reduced perspective for less distortion
            }}
            className={`group shrink-0 cursor-pointer snap-center ${compact ? 'w-28 md:w-44' : 'w-44'}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`w-full aspect-4/3 rounded-xl relative overflow-hidden transition-all duration-500 ease-out border ${isActive ? 'border-white/40 ring-1 ring-white/40 shadow-2xl' : 'border-white/5 shadow-lg group-hover:shadow-xl'}`}
                style={{
                    background: theme.bg,
                    transformStyle: "preserve-3d",
                    rotateX,
                    rotateY,
                }}
                whileHover={{ scale: 1.02 }} // Subtle scale
                whileTap={{ scale: 0.98 }}
            >
                {/* Spotlight Overlay */}
                <motion.div
                    className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: spotlight, mixBlendMode: 'overlay' }}
                />

                {/* Inner Content - Subtle Depth */}
                <div style={{ transform: "translateZ(10px)" }} className="relative w-full h-full pointer-events-none p-4 opacity-90 group-hover:opacity-100 transition-opacity">

                    {/* Abstract Content Layout */}
                    <div className="flex flex-col gap-2 h-full">
                        {/* Header Line */}
                        <div className="w-1/3 h-1.5 rounded-full opacity-20" style={{ background: theme.text }} />

                        {/* Body Lines */}
                        <div className="space-y-1.5 mt-2">
                            <div className="w-full h-1 rounded-full opacity-10" style={{ background: theme.text }} />
                            <div className="w-3/4 h-1 rounded-full opacity-10" style={{ background: theme.text }} />
                            <div className="w-5/6 h-1 rounded-full opacity-10" style={{ background: theme.text }} />
                        </div>

                        {/* Floating Accent Element - Bottom Right */}
                        <div
                            className="absolute bottom-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
                            style={{
                                background: theme.accent,
                                transform: "translateZ(15px)",
                            }}
                        >
                            {isActive && (
                                <motion.svg
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-3.5 h-3.5 text-white/90"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </motion.svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Glass Reflection Tint */}
                <div className="absolute inset-0 bg-linear-to-tr from-white/5 via-white/0 to-transparent group-hover:from-white/10 transition-colors duration-500 pointer-events-none" />

            </motion.div>

            <div className={`text-center relative transition-all duration-300 group-hover:translate-y-0.5 ${compact ? 'mt-1.5' : 'mt-3'}`}>
                <span className={`font-medium tracking-widest uppercase transition-colors duration-300 ${compact ? 'text-[9px] md:text-[11px]' : 'text-[11px]'} ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                    {theme.name}
                </span>
                {isActive && (
                    <motion.div
                        layoutId="activeThemeIndicator"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60"
                        transition={{ duration: 0.3 }}
                    />
                )}
            </div>
        </motion.div>
    );
};
