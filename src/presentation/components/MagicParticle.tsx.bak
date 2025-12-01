import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
}

interface MagicParticleProps {
    particle: Particle;
    onComplete: (id: number) => void;
}

export const MagicParticle: React.FC<MagicParticleProps> = ({ particle, onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete(particle.id);
        }, 1500);
        return () => clearTimeout(timer);
    }, [particle.id, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1, scale: 0, y: 0 }}
            animate={{
                opacity: 0,
                scale: [0, 1.2, 0.8, 0],
                y: -30,
                rotate: [0, 180, 360]
            }}
            transition={{
                duration: 1.5,
                ease: "easeOut"
            }}
            style={{
                position: 'absolute',
                left: particle.x,
                top: particle.y,
                pointerEvents: 'none',
                zIndex: 9999
            }}
        >
            {/* Star SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill={particle.color}
                    stroke={particle.color}
                    strokeWidth="1"
                    opacity="0.8"
                />
            </svg>

            {/* Sparkle effect */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: particle.color,
                    boxShadow: `0 0 8px ${particle.color}`
                }}
            />
        </motion.div>
    );
};
