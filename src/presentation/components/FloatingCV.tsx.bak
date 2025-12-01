import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useParticleTrail } from '../hooks/useParticleTrail';
import { MagicParticle } from './MagicParticle';
import { useCVStore } from '../../application/store/cv-store';

interface FloatingCVProps {
    children: ReactNode;
    disableMagnetism?: boolean;
}

const darkenColor = (hex: string, percent: number = 40): string => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const darkenedR = Math.floor(r * (1 - percent / 100));
    const darkenedG = Math.floor(g * (1 - percent / 100));
    const darkenedB = Math.floor(b * (1 - percent / 100));
    return `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
};

export const FloatingCV: React.FC<FloatingCVProps> = ({ children, disableMagnetism = false }) => {
    const [position, setPosition] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
    const [cursorRotation, setCursorRotation] = useState({ rotateX: 0, rotateY: 0 });
    const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const profile = useCVStore(state => state.profile);
    const cvColor = profile.metadata?.accentColor || '#6366f1';
    const shadowColor = darkenColor(cvColor, 40);

    const { particles, removeParticle, handleMouseMove, containerRef } = useParticleTrail(cvColor);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Floating animation - RESTORED for mobile
    useEffect(() => {
        if (isHovering || disableMagnetism) return;

        const interval = setInterval(() => {
            setPosition({
                x: Math.sin(Date.now() / 3000) * 8,
                y: Math.cos(Date.now() / 4000) * 8,
                rotateX: Math.sin(Date.now() / 5000) * 3,
                rotateY: Math.cos(Date.now() / 6000) * 3,
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isHovering, disableMagnetism]);

    // PC Magnetism
    const handleCursorMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || disableMagnetism) return;

        const rect = containerRef.current.getBoundingClientRect();
        const cvCenterX = rect.left + rect.width / 2;
        const cvCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - cvCenterX;
        const deltaY = e.clientY - cvCenterY;

        const offsetX = deltaX * 0.08;
        const offsetY = deltaY * 0.08;

        setCursorOffset({ x: offsetX, y: offsetY });

        const rotateY = (deltaX / rect.width) * 12;
        const rotateX = -(deltaY / rect.height) * 12;
        setCursorRotation({ rotateX, rotateY });
    }, [containerRef, disableMagnetism]);

    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        if (!containerRef.current || e.touches.length === 0) return;

        const touch = e.touches[0];
        const mouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY
        } as React.MouseEvent<HTMLDivElement>;
        handleMouseMove(mouseEvent);
    }, [containerRef, handleMouseMove]);

    const handleCursorEnter = useCallback(() => {
        if (!disableMagnetism) setIsHovering(true);
    }, [disableMagnetism]);

    const handleCursorLeave = useCallback(() => {
        setIsHovering(false);
        setCursorRotation({ rotateX: 0, rotateY: 0 });
        setCursorOffset({ x: 0, y: 0 });
    }, []);

    const handleTouchStart = useCallback(() => {
        // Don't activate hover state on mobile
    }, []);

    const handleTouchEnd = useCallback(() => {
        // Clean state
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            style={{
                perspective: isMobile ? '1200px' : '2500px'
            }}
            onMouseMove={(e) => {
                if (!disableMagnetism) {
                    handleMouseMove(e);
                    handleCursorMove(e);
                }
            }}
            onMouseEnter={handleCursorEnter}
            onMouseLeave={handleCursorLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Particle trail */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
                {particles.map(particle => (
                    <MagicParticle key={particle.id} particle={particle} onComplete={removeParticle} />
                ))}
            </div>

            <motion.div
                animate={{
                    x: (isHovering && !disableMagnetism) ? cursorOffset.x : position.x,
                    y: (isHovering && !disableMagnetism) ? cursorOffset.y : position.y,
                    rotateX: (isHovering && !disableMagnetism) ? cursorRotation.rotateX : position.rotateX,
                    rotateY: (isHovering && !disableMagnetism) ? cursorRotation.rotateY : position.rotateY,
                }}
                transition={{ type: "spring", stiffness: 40, damping: 20, mass: 1.2 }}
                style={{
                    transformStyle: isMobile ? 'flat' : 'preserve-3d',
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    filter: isMobile
                        ? `
                            drop-shadow(0 80px 150px ${shadowColor}70) 
                            drop-shadow(0 40px 80px ${shadowColor}90)
                            drop-shadow(0 20px 40px ${shadowColor}100)
                        `
                        : `
                            drop-shadow(0 40px 80px ${shadowColor}50) 
                            drop-shadow(0 20px 40px ${shadowColor}70)
                            drop-shadow(0 10px 20px ${shadowColor}90)
                        `
                }}
                className="rounded-xl"
            >
                {/* Enhanced glow */}
                <motion.div
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-xl blur-3xl -z-10"
                    style={{
                        transform: isMobile ? 'translateZ(-50px)' : 'translateZ(-30px)',
                        background: isMobile
                            ? `radial-gradient(circle at center, ${cvColor}80, ${cvColor}60, transparent)`
                            : `radial-gradient(circle at center, ${cvColor}50, ${cvColor}30, transparent)`
                    }}
                />

                {/* Depth layers */}
                <div
                    className="absolute inset-0 rounded-xl -z-20"
                    style={{
                        transform: isMobile ? 'translateZ(-70px)' : 'translateZ(-50px)',
                        background: `linear-gradient(135deg, ${shadowColor}${isMobile ? '50' : '30'}, ${shadowColor}${isMobile ? '30' : '15'})`,
                        filter: isMobile ? 'blur(40px)' : 'blur(25px)'
                    }}
                />

                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                    {children}
                </div>
            </motion.div>
        </div>
    );
};
