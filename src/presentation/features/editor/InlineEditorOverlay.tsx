/**
 * Inline Editor Overlay - Compact popup positioned near click
 * Uses global store for single-popup behavior
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInlineEditorStore } from '../../../application/store/inline-editor-store';
import { X, Check } from 'lucide-react';

export const InlineEditorOverlay: React.FC = () => {
    const { isOpen, fieldLabel, currentValue, clickPosition, closeEditor, saveAndClose } = useInlineEditorStore();
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setInputValue(currentValue);
            setTimeout(() => {
                if (currentValue.length > 50) {
                    textareaRef.current?.focus();
                    textareaRef.current?.select();
                } else {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            }, 100);
        }
    }, [isOpen, currentValue]);

    const handleSave = () => {
        saveAndClose(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            closeEditor();
        } else if (e.key === 'Enter' && !e.shiftKey && currentValue.length <= 50) {
            e.preventDefault();
            handleSave();
        }
    };

    if (!isOpen) return null;

    const isMultiline = currentValue.length > 50;

    // Format label nicely
    const formatLabel = (label: string) => {
        return label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    };

    // Calculate position near click, clamped to viewport
    const getPositionStyle = (): React.CSSProperties => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;
        const popupWidth = isMobile ? 240 : 260;
        const popupHeight = isMultiline ? 150 : 100;

        let x = clickPosition.x - popupWidth / 2;
        let y = clickPosition.y + 10;

        // Clamp X
        if (x + popupWidth > viewportWidth - 16) {
            x = viewportWidth - popupWidth - 16;
        }
        if (x < 16) x = 16;

        // Clamp Y
        if (y + popupHeight > viewportHeight - (isMobile ? 100 : 20)) {
            y = clickPosition.y - popupHeight - 10;
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
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-[9998]"
                        onClick={closeEditor}
                    />

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
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-1.5 flex items-center justify-between">
                                <span className="font-medium text-white text-xs truncate">
                                    {formatLabel(fieldLabel)}
                                </span>
                                <button onClick={closeEditor} className="p-1 hover:bg-white/20 rounded">
                                    <X size={14} className="text-white" />
                                </button>
                            </div>

                            <div className="p-2">
                                {isMultiline ? (
                                    <textarea
                                        ref={textareaRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        rows={3}
                                        className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-400 resize-none"
                                        placeholder="Entrez le texte..."
                                    />
                                ) : (
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full px-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-400"
                                        placeholder="Entrez le texte..."
                                    />
                                )}

                                <div className="flex items-center justify-end mt-2 gap-1">
                                    <button
                                        onClick={closeEditor}
                                        className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-500 text-white rounded-lg hover:bg-indigo-400"
                                    >
                                        <Check size={12} />
                                        OK
                                    </button>
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
