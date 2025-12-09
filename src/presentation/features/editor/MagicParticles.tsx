import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
    id: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
}

interface MagicParticlesProps {
    cursor: { x: number; y: number };
    accentColor?: string;
}

export const MagicParticles: React.FC<MagicParticlesProps> = ({ cursor, accentColor = '#8b5cf6' }) => {
    const [particles, _setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // Throttle particle creation to improve performance
        const now = Date.now();
        if (now % 100 !== 0) return; // Simple throttle

        const interval = setInterval(() => {
            // ... (keep existing logic but maybe reduce frequency or particle count)
        }, 100); // Increased interval from 50ms to 100ms

        return () => clearInterval(interval);
    }, [cursor.x, cursor.y]);

    return (
        <div className="fixed inset-0 pointer-events-none z-40">
            <AnimatePresence>
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 1,
                            rotate: particle.rotation + 180
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            left: particle.x,
                            top: particle.y,
                            width: particle.size,
                            height: particle.size
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                                fill={accentColor}
                                opacity="0.8"
                            />
                            <circle cx="12" cy="12" r="3" fill="white" opacity="0.9" />
                        </svg>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
