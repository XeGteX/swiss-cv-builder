/**
 * TELEKINESIS - Mode Toggle Button
 * 
 * Floating button to switch between write and structure modes
 */

import React from 'react';
import { Edit3, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMode, useToggleMode } from '../../../application/store/v2';

export const ModeToggleButton: React.FC = () => {
    const mode = useMode();
    const toggleMode = useToggleMode();

    const isStructure = mode === 'structure';

    return (
        <motion.button
            onClick={toggleMode}
            className={`
                fixed bottom-8 right-8 z-50
                flex items-center gap-3 px-6 py-4 rounded-2xl
                font-semibold text-white shadow-2xl
                transition-all duration-300
                ${isStructure
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 ring-4 ring-purple-300'
                    : 'bg-gradient-to-r from-slate-600 to-slate-700'
                }
            `}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            title={isStructure ? 'Passer en mode édition' : 'Passer en mode structure'}
        >
            {/* Icon with animation */}
            <motion.div
                animate={{ rotate: isStructure ? 360 : 0 }}
                transition={{ duration: 0.5 }}
            >
                {isStructure ? <Box size={20} /> : <Edit3 size={20} />}
            </motion.div>

            {/* Label */}
            <div className="flex flex-col items-start">
                <span className="text-[10px] opacity-75">
                    {isStructure ? 'Mode' : 'Mode'}
                </span>
                <span className="text-sm font-bold">
                    {isStructure ? '🧱 Structure' : '✏️ Édition'}
                </span>
            </div>

            {/* Indicator dot */}
            <motion.div
                className={`w-2 h-2 rounded-full ${isStructure ? 'bg-white' : 'bg-green-400'}`}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.button>
    );
};
