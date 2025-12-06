import React from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../application/store/settings-store';
import { useIsMobile } from '../hooks/useMediaQuery';

export const ImmersiveBackground: React.FC = () => {
    const { themeColor } = useSettingsStore();
    const isMobile = useIsMobile();

    // Map theme colors to gradient definitions
    const getGradients = (color: string) => {
        switch (color) {
            case 'purple': // Creative
                return {
                    bg: 'from-purple-950 via-slate-900 to-pink-950',
                    orb1: 'from-purple-600 to-pink-600',
                    orb2: 'from-purple-600 to-pink-600',
                    primary: 'rgb(147, 51, 234)'
                };
            case 'amber': // Executive
                return {
                    bg: 'from-amber-950 via-slate-900 to-orange-950',
                    orb1: 'from-amber-600 to-orange-600',
                    orb2: 'from-amber-600 to-orange-600',
                    primary: 'rgb(217, 119, 6)'
                };
            case 'slate': // Classic
                return {
                    bg: 'from-slate-950 via-gray-900 to-slate-950',
                    orb1: 'from-slate-600 to-gray-600',
                    orb2: 'from-slate-600 to-gray-600',
                    primary: 'rgb(71, 85, 105)'
                };
            case 'blue': // Modern (Default)
            default:
                return {
                    bg: 'from-blue-950 via-slate-900 to-cyan-950',
                    orb1: 'from-blue-600 to-cyan-600',
                    orb2: 'from-blue-600 to-cyan-600',
                    primary: 'rgb(37, 99, 235)'
                };
        }
    };

    const theme = getGradients(themeColor);

    return (
        <motion.div
            className={`fixed inset-0 -z-50 bg-gradient-to-br ${theme.bg}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
        >
            {/* Background orbs - STATIC on mobile to prevent flickering */}
            {isMobile ? (
                <>
                    {/* Static orbs for mobile - no animations to prevent flickering */}
                    <div
                        className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${theme.orb1} rounded-full blur-[100px] opacity-15`}
                    />
                    <div
                        className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr ${theme.orb2} rounded-full blur-[100px] opacity-10`}
                    />
                </>
            ) : (
                <>
                    {/* Animated orbs for desktop only */}
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

            {/* Noise Texture Overlay for texture - hidden on mobile for perf */}
            {!isMobile && (
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            )}
        </motion.div>
    );
};
