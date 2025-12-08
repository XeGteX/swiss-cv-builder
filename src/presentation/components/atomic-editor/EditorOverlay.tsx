/**
 * Editor Overlay - Compact popup positioned near click
 * Used by EditableField component
 */
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Wand2 } from 'lucide-react';

interface EditorOverlayProps {
    isOpen: boolean;
    position: { x: number; y: number };
    value: string;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    validation?: any;
    aiEnabled?: boolean;
    onSave: (value: string) => void;
    onCancel: () => void;
    onAIEnhance?: (value: string) => Promise<string>;
}

export const EditorOverlay: React.FC<EditorOverlayProps> = ({
    isOpen,
    position,
    value,
    label,
    placeholder,
    multiline,
    aiEnabled,
    onSave,
    onCancel,
    onAIEnhance
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const [isEnhancing, setIsEnhancing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalValue(value);
            setTimeout(() => {
                if (multiline) {
                    textareaRef.current?.focus();
                    textareaRef.current?.select();
                } else {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            }, 100);
        }
    }, [isOpen, value, multiline]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        } else if (e.key === 'Enter' && !e.shiftKey && !multiline) {
            e.preventDefault();
            onSave(localValue);
        }
    };

    const handleAIEnhance = async () => {
        if (!onAIEnhance || isEnhancing) return;
        setIsEnhancing(true);
        try {
            const enhanced = await onAIEnhance(localValue);
            setLocalValue(enhanced);
        } catch (e) {
            console.error('AI enhance failed:', e);
        } finally {
            setIsEnhancing(false);
        }
    };

    if (!isOpen) return null;

    // Calculate position near click, clamped to viewport
    const getPositionStyle = (): React.CSSProperties => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;
        const popupWidth = isMobile ? 240 : 260;
        const popupHeight = multiline ? 150 : 100;

        let x = position.x - popupWidth / 2;
        let y = position.y + 10;

        // Clamp X
        if (x + popupWidth > viewportWidth - 16) {
            x = viewportWidth - popupWidth - 16;
        }
        if (x < 16) x = 16;

        // Clamp Y - if below viewport, show above
        if (y + popupHeight > viewportHeight - (isMobile ? 100 : 20)) {
            y = position.y - popupHeight - 10;
        }
        if (y < 60) y = 60;

        return {
            position: 'fixed',
            left: `${x}px`,
            top: `${y}px`,
            width: `${popupWidth}px`,
            zIndex: 9999
        };
    };

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - semi transparent */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-[9998]"
                        onClick={onCancel}
                    />

                    {/* Compact popup near click */}
                    <motion.div
                        key="popup"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 500 }}
                        style={getPositionStyle()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
                            {/* Compact header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-1.5 flex items-center justify-between">
                                <span className="font-medium text-white text-xs truncate">
                                    {label}
                                </span>
                                <button
                                    onClick={onCancel}
                                    className="p-1 hover:bg-white/20 rounded transition-colors"
                                >
                                    <X size={14} className="text-white" />
                                </button>
                            </div>

                            {/* Compact content */}
                            <div className="p-2">
                                {multiline ? (
                                    <textarea
                                        ref={textareaRef}
                                        value={localValue}
                                        onChange={(e) => setLocalValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        rows={3}
                                        className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none"
                                    />
                                ) : (
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={localValue}
                                        onChange={(e) => setLocalValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={placeholder}
                                        className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                                    />
                                )}

                                {/* Compact actions */}
                                <div className="flex items-center justify-between mt-2 gap-2">
                                    {aiEnabled && onAIEnhance ? (
                                        <button
                                            onClick={handleAIEnhance}
                                            disabled={isEnhancing}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-400 disabled:opacity-50"
                                        >
                                            <Wand2 size={12} className={isEnhancing ? 'animate-spin' : ''} />
                                            IA
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={onCancel}
                                            className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => onSave(localValue)}
                                            className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-400"
                                        >
                                            <Check size={12} />
                                            OK
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(modal, document.body);
};
