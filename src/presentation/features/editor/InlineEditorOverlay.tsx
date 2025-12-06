import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInlineEditor } from '../../hooks/useInlineEditor';
import { useIsMobile } from '../../hooks/useMediaQuery';

export const InlineEditorOverlay: React.FC = () => {
    const { state, closeEditor, confirm } = useInlineEditor();
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isMobile = useIsMobile();

    const isMultiline = state.value && state.value.length > 50;

    useEffect(() => {
        if (state.isOpen) {
            setTimeout(() => {
                if (isMultiline) {
                    textareaRef.current?.focus();
                    textareaRef.current?.select();
                } else {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            }, 50);
        }
    }, [state.isOpen, isMultiline]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            closeEditor();
        } else if (e.key === 'Enter' && !e.shiftKey && !isMultiline) {
            e.preventDefault();
            confirm(state.value);
        }
    };

    if (!state.isOpen || !state.meta) return null;

    // On mobile: center at bottom of screen (above MobileBottomNav)
    // On desktop: use calculated position, but clamp to viewport
    const getPositionStyle = () => {
        if (isMobile) {
            // Fixed position at bottom center
            return {
                left: '50%',
                bottom: '100px', // Above MobileBottomNav
                transform: 'translateX(-50%)',
                maxWidth: 'calc(100vw - 32px)',
                width: '100%'
            };
        }

        // Desktop: use position but clamp to viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const editorWidth = 400;
        const editorHeight = 200;

        let x = state.position.x;
        let y = state.position.y;

        // Clamp X to viewport
        if (x + editorWidth > viewportWidth - 20) {
            x = viewportWidth - editorWidth - 20;
        }
        if (x < 20) x = 20;

        // Clamp Y to viewport
        if (y + editorHeight > viewportHeight - 20) {
            y = viewportHeight - editorHeight - 20;
        }
        if (y < 20) y = 20;

        return {
            left: `${x}px`,
            top: `${y}px`,
            maxWidth: '500px'
        };
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: isMobile ? 20 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: isMobile ? 20 : -10 }}
                className="fixed z-[100]"
                style={getPositionStyle()}
            >
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-lg shadow-2xl p-4 min-w-[300px]">
                    <div className="text-xs font-bold mb-2 uppercase tracking-wide opacity-90">
                        {state.meta.label}
                    </div>

                    {isMultiline ? (
                        <textarea
                            ref={textareaRef}
                            value={state.value}
                            onChange={(e) => confirm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={4}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 font-medium"
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type="text"
                            value={state.value}
                            onChange={(e) => confirm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 font-medium"
                        />
                    )}

                    <div className="flex items-center justify-between mt-3 text-xs opacity-75">
                        <div>
                            {state.meta.required && <span className="bg-white/20 px-2 py-1 rounded">Required</span>}
                            {state.meta.removable && <span className="bg-white/20 px-2 py-1 rounded ml-2">Removable</span>}
                        </div>
                        <div className="text-right">
                            <kbd className="bg-white/20 px-2 py-1 rounded mr-1">Enter</kbd> to save
                            <kbd className="bg-white/20 px-2 py-1 rounded ml-2">Esc</kbd> to cancel
                        </div>
                    </div>

                    {state.meta.removable && !state.value.trim() && (
                        <div className="mt-2 text-xs bg-yellow-500/20 border border-yellow-500/40 rounded px-2 py-1">
                            ⚠️ Empty field will be removed
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
