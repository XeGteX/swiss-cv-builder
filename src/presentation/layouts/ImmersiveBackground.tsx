import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../application/store/settings-store';
import { useIsMobile } from '../hooks/useMediaQuery';

/**
 * ImmersiveBackground - Animated aurora background with shooting stars
 * 
 * Features:
 * - Aurora orbs (CSS animated on mobile, Framer Motion on desktop)
 * - Shooting stars crossing the screen
 * - GPU-accelerated for 60fps
 */

export const ImmersiveBackground: React.FC = () => {
    const { themeColor } = useSettingsStore();
    const isMobile = useIsMobile();

    const getGradients = (color: string) => {
        switch (color) {
            case 'purple':
                return {
                    bg: 'from-purple-950 via-slate-900 to-pink-950',
                    orb1: 'from-purple-600 to-pink-600',
                    orb2: 'from-purple-600 to-pink-600',
                };
            case 'amber':
                return {
                    bg: 'from-amber-950 via-slate-900 to-orange-950',
                    orb1: 'from-amber-600 to-orange-600',
                    orb2: 'from-amber-600 to-orange-600',
                };
            case 'slate':
                return {
                    bg: 'from-slate-950 via-gray-900 to-slate-950',
                    orb1: 'from-slate-600 to-gray-600',
                    orb2: 'from-slate-600 to-gray-600',
                };
            case 'blue':
            default:
                return {
                    bg: 'from-blue-950 via-slate-900 to-cyan-950',
                    orb1: 'from-blue-600 to-cyan-600',
                    orb2: 'from-blue-600 to-cyan-600',
                };
        }
    };

    const theme = getGradients(themeColor);

    return (
        <motion.div
            className={`fixed inset-0 -z-50 bg-gradient-to-br ${theme.bg} overflow-hidden`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* ===== SHOOTING STARS ===== */}
            <div className="shooting-stars-container">
                <div className="shooting-star star-1" />
                <div className="shooting-star star-2" />
                <div className="shooting-star star-3" />
                <div className="shooting-star star-4" />
                <div className="shooting-star star-5" />
            </div>

            {/* ===== AURORA ORBS ===== */}
            {isMobile ? (
                <>
                    <div
                        className={`absolute -top-32 -right-32 w-[450px] h-[450px] bg-gradient-to-br ${theme.orb1} rounded-full blur-[100px] orb-float-1`}
                    />
                    <div
                        className={`absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-gradient-to-tr ${theme.orb2} rounded-full blur-[100px] orb-float-2`}
                    />
                </>
            ) : (
                <>
                    <motion.div
                        key={`orb-1-${themeColor}`}
                        className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${theme.orb1} rounded-full blur-[120px] opacity-20`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.div
                        key={`orb-2-${themeColor}`}
                        className={`absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-tr ${theme.orb2} rounded-full blur-[120px] opacity-15`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.15 }}
                        transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    />
                </>
            )}

            {/* Noise Texture - desktop only */}
            {!isMobile && (
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            )}

            {/* ===== CSS ANIMATIONS ===== */}
            <style>{`
                /* Shooting Stars Container */
                .shooting-stars-container {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                }
                
                /* Individual Shooting Star */
                .shooting-star {
                    position: absolute;
                    width: 150px;
                    height: 2px;
                    background: linear-gradient(90deg, 
                        rgba(167, 139, 250, 0) 0%, 
                        rgba(167, 139, 250, 0.6) 50%, 
                        rgba(255, 255, 255, 0.9) 100%
                    );
                    border-radius: 50%;
                    transform: rotate(-45deg) translateZ(0);
                    opacity: 0;
                    backface-visibility: hidden;
                }
                
                .shooting-star::before {
                    content: '';
                    position: absolute;
                    right: 0;
                    width: 6px;
                    height: 6px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 10px 2px rgba(167, 139, 250, 0.8);
                    transform: translateY(-2px);
                }
                
                /* Different positions and timings for each star */
                .star-1 {
                    top: 5%;
                    left: 25%;
                    animation: shoot 4s ease-in-out infinite;
                    animation-delay: 0s;
                }
                
                .star-2 {
                    top: 15%;
                    left: 60%;
                    width: 100px;
                    animation: shoot 5s ease-in-out infinite;
                    animation-delay: 1.5s;
                }
                
                .star-3 {
                    top: 35%;
                    left: 40%;
                    width: 120px;
                    animation: shoot 4.5s ease-in-out infinite;
                    animation-delay: 3s;
                }
                
                .star-4 {
                    top: 50%;
                    left: 80%;
                    width: 80px;
                    animation: shoot 6s ease-in-out infinite;
                    animation-delay: 2s;
                }
                
                .star-5 {
                    top: 25%;
                    left: 10%;
                    width: 180px;
                    animation: shoot 5.5s ease-in-out infinite;
                    animation-delay: 4s;
                }
                
                @keyframes shoot {
                    0% {
                        transform: rotate(-45deg) translateX(0) translateZ(0);
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    20% {
                        transform: rotate(-45deg) translateX(400px) translateZ(0);
                        opacity: 0;
                    }
                    100% {
                        transform: rotate(-45deg) translateX(400px) translateZ(0);
                        opacity: 0;
                    }
                }
                
                /* Aurora Orb Animations */
                .orb-float-1 {
                    opacity: 0.15;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    animation: orb-drift-1 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                
                .orb-float-2 {
                    opacity: 0.12;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    animation: orb-drift-2 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    animation-delay: -2s;
                }
                
                @keyframes orb-drift-1 {
                    0%, 100% { transform: translateZ(0) scale(1) translate(0, 0); }
                    25% { transform: translateZ(0) scale(1.05) translate(-15px, 10px); }
                    50% { transform: translateZ(0) scale(0.95) translate(-5px, 20px); }
                    75% { transform: translateZ(0) scale(1.02) translate(10px, 5px); }
                }
                
                @keyframes orb-drift-2 {
                    0%, 100% { transform: translateZ(0) scale(1) translate(0, 0); }
                    25% { transform: translateZ(0) scale(0.97) translate(20px, -10px); }
                    50% { transform: translateZ(0) scale(1.03) translate(10px, -25px); }
                    75% { transform: translateZ(0) scale(0.98) translate(-10px, -15px); }
                }
            `}</style>
        </motion.div>
    );
};
