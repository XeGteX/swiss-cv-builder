import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RippleProps {
    x: number;
    y: number;
    color: string;
    onComplete: () => void;
}

export const RippleEffect: React.FC<RippleProps> = ({ x, y, color, onComplete }) => {
    const [mounted, setMounted] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(false);
            onComplete();
        }, 1200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!mounted) return null;

    // MUCH MORE VISIBLE ripple effect
    return (
        <motion.div
            initial={{
                scale: 0.5,
                opacity: 1,
            }}
            animate={{
                scale: 25, // Huge scale to cover entire CV
                opacity: 0,
            }}
            transition={{
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            style={{
                position: 'fixed',
                left: x,
                top: y,
                width: '80px',
                height: '80px',
                marginLeft: '-40px',
                marginTop: '-40px',
                borderRadius: '50%',
                border: `8px solid ${color}`, // THICK border
                backgroundColor: `${color}30`, // Semi-transparent fill
                boxShadow: `0 0 60px ${color}90, 0 0 120px ${color}50`, // STRONG glow
                pointerEvents: 'none',
                zIndex: 10000,
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
            }}
        />
    );
};
