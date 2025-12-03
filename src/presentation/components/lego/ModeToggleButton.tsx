/**
 * TELEKINESIS - Mode Toggle Button (V3)
 * 
 * Floating button to cycle between 3 modes: édition → structure → modèle
 */

import React from 'react';
import { Edit3, Box, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useMode, useSetMode } from '../../../application/store/v2';
import type { CVMode } from '../../../application/store/v2';
import { DesignTokens } from '../../design-system/tokens';

export const ModeToggleButton: React.FC = () => {
    const mode = useMode();
    const setMode = useSetMode();
    const location = useLocation();

    // Hide button on templates page
    if (location.pathname === '/templates') {
        return null;
    }

    const cycleMode = () => {
        const modes: CVMode[] = ['edition', 'structure', 'modele', 'ai'];
        const currentIndex = modes.indexOf(mode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setMode(modes[nextIndex]);
    };

    // Mode-specific config - using semantic gradients from design tokens
    const modeConfig: Record<CVMode, { icon: React.ElementType; label: string; gradient: string; ring: string }> = {
        edition: {
            icon: Edit3,
            label: '✏️ Édition',
            gradient: DesignTokens.gradients.success, // Green for editor
            ring: ''
        },
        structure: {
            icon: Box,
            label: '🧱 Structure',
            gradient: DesignTokens.gradients.info, // Blue for structure
            ring: 'ring-4 ring-blue-300'
        },
        modele: {
            icon: Palette,
            label: '🎨 Modèle',
            gradient: DesignTokens.gradients.accent, // Pink for creative
            ring: 'ring-4 ring-pink-300'
        },
        ai: {
            icon: Edit3,
            label: '✨ IA',
            gradient: DesignTokens.gradients.warning, // Amber for AI
            ring: 'ring-4 ring-amber-300'
        }
    };

    const config = modeConfig[mode];
    const Icon = config.icon;

    return (
        <motion.button
            onClick={cycleMode}
            className={`
                fixed bottom-8 right-8 z-50
                flex items-center gap-3 px-6 py-4 rounded-2xl
                font-semibold text-white shadow-2xl
                transition-all duration-300
                bg-gradient-to-r ${config.gradient} ${config.ring}
            `}
            whileHover={DesignTokens.interactions.hover}
            whileTap={DesignTokens.interactions.tap}
            title={`Mode actuel: ${mode}. Cliquer pour changer`}
        >
            {/* Icon with rotation animation */}
            <motion.div
                animate={{ rotate: mode === 'structure' ? 360 : 0 }}
                transition={{ duration: 0.5 }}
            >
                <Icon size={20} />
            </motion.div>

            {/* Label */}
            <div className="flex flex-col items-start">
                <span className="text-[10px] opacity-75">
                    Mode
                </span>
                <span className="text-sm font-bold">
                    {config.label}
                </span>
            </div>

            {/* Indicator dot */}
            <motion.div
                className="w-2 h-2 rounded-full bg-white"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.button>
    );
};
