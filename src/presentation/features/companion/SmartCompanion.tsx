/**
 * SmartCompanion - Interactive NEXAL Studio Remote Control
 * 
 * The rocket mascot with magic action buttons to quickly apply design presets.
 * 
 * Magic Actions:
 * - 🎨 "Make it Pop" → Creative style (Pink, Modern, Sans)
 * - 👔 "Professionalize" → Serious style (Navy, Classic, Serif)
 * - 🇺🇸 "Silicon Valley Mode" → US startup style (Minimal, Sidebar)
 * 
 * SIMPLIFIED VERSION: Uses store directly to avoid hook-related infinite loops
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Briefcase, Zap, X } from 'lucide-react';

// Direct store access to avoid hook issues
import { useCVStoreV2 } from '../../../application/store/v2';

// ============================================================================
// TYPES
// ============================================================================

interface SmartCompanionProps {
    className?: string;
}

// ============================================================================
// CHAT BUBBLE COMPONENT
// ============================================================================

interface ChatBubbleProps {
    isOpen: boolean;
    onClose: () => void;
    onAction: (actionId: string) => void;
    executingAction: string | null;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
    isOpen,
    onClose,
    onAction,
    executingAction
}) => {
    const actions = [
        {
            id: 'pop',
            icon: <Sparkles className="w-4 h-4" />,
            label: 'Make it Pop!',
            description: 'Créatif & moderne',
            bgColor: 'bg-pink-500'
        },
        {
            id: 'pro',
            icon: <Briefcase className="w-4 h-4" />,
            label: 'Professionalize',
            description: 'Sérieux & élégant',
            bgColor: 'bg-blue-900'
        },
        {
            id: 'silicon',
            icon: <Zap className="w-4 h-4" />,
            label: 'Silicon Valley',
            description: 'Style startup US',
            bgColor: 'bg-black'
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute bottom-full right-0 mb-3 w-64"
                >
                    {/* Bubble */}
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                            <span className="text-sm font-bold flex items-center gap-1">
                                ✨ Magic Actions
                            </span>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="p-2 space-y-1">
                            {actions.map((action) => (
                                <motion.button
                                    key={action.id}
                                    onClick={() => onAction(action.id)}
                                    disabled={executingAction !== null}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${executingAction === action.id
                                            ? 'bg-indigo-100 border-2 border-indigo-400'
                                            : 'bg-gray-50 hover:bg-indigo-50 border-2 border-transparent'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${action.bgColor} text-white`}>
                                        {action.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-800">
                                            {action.label}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {action.description}
                                        </div>
                                    </div>
                                    {executingAction === action.id && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Footer tip */}
                        <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-500 text-center">
                            🚀 Design appliqué instantanément
                        </div>
                    </div>

                    {/* Arrow pointer */}
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// MAIN COMPONENT: SMART COMPANION
// ============================================================================

export const SmartCompanion: React.FC<SmartCompanionProps> = ({ className = '' }) => {
    const [isBubbleOpen, setIsBubbleOpen] = useState(false);
    const [executingAction, setExecutingAction] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    // Get actions directly from store (stable references)
    const setAccentColor = useCVStoreV2(state => state.setAccentColor);
    const setHeaderStyle = useCVStoreV2(state => state.setHeaderStyle);
    const setFontPairing = useCVStoreV2(state => state.setFontPairing);

    const handleRocketClick = useCallback(() => {
        setIsBubbleOpen(prev => !prev);
    }, []);

    const handleAction = useCallback((actionId: string) => {
        // Start animation
        setExecutingAction(actionId);
        setIsShaking(true);

        // Execute the action
        switch (actionId) {
            case 'pop':
                setAccentColor('#FF3366');
                setHeaderStyle('modern');
                setFontPairing('sans');
                break;
            case 'pro':
                setAccentColor('#1e3a8a');
                setHeaderStyle('classic');
                setFontPairing('serif');
                break;
            case 'silicon':
                setAccentColor('#000000');
                setHeaderStyle('minimal');
                setFontPairing('mono');
                break;
        }

        // End animation after delay
        setTimeout(() => {
            setExecutingAction(null);
            setIsShaking(false);
            setIsBubbleOpen(false);
        }, 800);
    }, [setAccentColor, setHeaderStyle, setFontPairing]);

    return (
        <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
            {/* Chat Bubble */}
            <ChatBubble
                isOpen={isBubbleOpen}
                onClose={() => setIsBubbleOpen(false)}
                onAction={handleAction}
                executingAction={executingAction}
            />

            {/* Rocket Button */}
            <motion.button
                onClick={handleRocketClick}
                animate={isShaking ? {
                    x: [0, -3, 3, -3, 3, 0],
                    rotate: [0, -5, 5, -5, 5, 0],
                } : {}}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-4 rounded-full shadow-lg transition-all ${isBubbleOpen
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        : 'bg-gradient-to-br from-slate-800 to-slate-900'
                    }`}
            >
                {/* Rocket emoji */}
                <motion.span
                    className="text-3xl select-none"
                    animate={isShaking ? { y: [0, -5, 0] } : {}}
                    transition={{ duration: 0.2, repeat: isShaking ? 2 : 0 }}
                >
                    🚀
                </motion.span>

                {/* Pulse ring when bubble is open */}
                {isBubbleOpen && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-indigo-400"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                )}

                {/* Sparkle badge */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center"
                >
                    <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
            </motion.button>
        </div>
    );
};

export default SmartCompanion;
