import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { DesignTokens } from '../../design-system/tokens';

interface FocusModeToggleProps {
    isFocusMode: boolean;
    toggleFocusMode: () => void;
}

export const FocusModeToggle: React.FC<FocusModeToggleProps> = ({ isFocusMode, toggleFocusMode }) => {
    return (
        <motion.button
            onClick={toggleFocusMode}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full
                font-medium text-sm
                transition-all duration-300
                ${isFocusMode
                    ? 'bg-slate-900 text-white shadow-lg ring-2 ring-indigo-500/50'
                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-600 shadow-sm border border-slate-200/50'
                }
            `}
            whileHover={DesignTokens.interactions.hover}
            whileTap={DesignTokens.interactions.tap}
            title={isFocusMode ? "Quitter le mode Focus" : "Mode Focus (Plein écran)"}
        >
            {isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isFocusMode ? 'Quitter Focus' : 'Focus'}</span>
        </motion.button>
    );
};
