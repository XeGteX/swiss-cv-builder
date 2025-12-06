/**
 * CV Engine v2 - Editor Overlay
 * 
 * Floating editor UI that appears when editing a field.
 * Features: auto-focus, keyboard shortcuts, validation feedback, AI enhancement.
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Loader } from 'lucide-react';
import type { ValidationRule, ValidationResult } from './validators';
import { validateField } from './validators';

interface EditorOverlayProps {
    isOpen: boolean;
    position: { x: number; y: number };
    value: string;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    validation?: ValidationRule;
    aiEnabled?: boolean;
    onSave: (value: string) => void;
    onCancel: () => void;
    onAIEnhance?: (currentValue: string) => Promise<string>;
}

export const EditorOverlay: React.FC<EditorOverlayProps> = ({
    isOpen,
    position,
    value: initialValue,
    label,
    placeholder,
    multiline = false,
    validation,
    aiEnabled = false,
    onSave,
    onCancel,
    onAIEnhance
}) => {
    const [value, setValue] = useState(initialValue);
    const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
    const [isEnhancing, setIsEnhancing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Update value when initialValue changes
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    // Auto-focus and select text when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (multiline) {
                    textareaRef.current?.focus();
                    textareaRef.current?.select();
                } else {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            }, 50);
        }
    }, [isOpen, multiline]);

    // Validate on change
    useEffect(() => {
        if (validation) {
            const result = validateField(value, validation);
            setValidationResult(result);
        }
    }, [value, validation]);

    const handleSave = () => {
        if (validation) {
            const result = validateField(value, validation);
            if (!result.isValid) {
                setValidationResult(result);
                return;
            }
        }
        onSave(value);
    };

    const handleAIEnhance = async () => {
        if (!onAIEnhance || !value.trim()) return;

        setIsEnhancing(true);
        try {
            const enhanced = await onAIEnhance(value);
            setValue(enhanced);
        } catch (error) {
            console.error('AI Enhancement failed:', error);
            // Optionally show error toast
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        } else if (e.key === 'Enter' && !multiline && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
            // Ctrl+Enter in textarea = save
            e.preventDefault();
            handleSave();
        }
    };

    if (!isOpen) return null;

    // Calculate position - center the overlay on the click point, keep in viewport
    const overlayWidth = 380;
    const overlayHeight = multiline ? 280 : 180;

    // Center horizontally on click position, but keep within viewport
    let left = position.x - overlayWidth / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - overlayWidth - 10));

    // Position below the element, but flip above if near bottom
    let top = position.y;
    if (position.y + overlayHeight > window.innerHeight - 20) {
        // Flip to above the element if not enough space below
        top = Math.max(10, position.y - overlayHeight - 50);
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[9999]"
                style={{
                    left: left,
                    top: top
                }}
            >
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-lg shadow-2xl p-4 min-w-[320px] max-w-[500px]">
                    {/* Label */}
                    <div className="text-xs font-bold mb-2 uppercase tracking-wide opacity-90 flex items-center justify-between">
                        <span>{label}</span>
                        {aiEnabled && multiline && (
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">
                                <Sparkles size={10} />
                                AI Ready
                            </span>
                        )}
                    </div>

                    {/* Input / Textarea */}
                    {multiline ? (
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            rows={4}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 font-medium resize-none"
                            disabled={isEnhancing}
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/40 font-medium"
                            disabled={isEnhancing}
                        />
                    )}

                    {/* Validation Error */}
                    {!validationResult.isValid && validationResult.error && (
                        <div className="mt-2 text-xs bg-red-500/20 border border-red-500/40 rounded px-2 py-1">
                            ⚠️ {validationResult.error}
                        </div>
                    )}

                    {/* AI Enhancement Button */}
                    {aiEnabled && multiline && onAIEnhance && (
                        <button
                            onClick={handleAIEnhance}
                            disabled={isEnhancing || !value.trim()}
                            className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isEnhancing ? (
                                <>
                                    <Loader className="animate-spin" size={14} />
                                    NanoBrain réfléchit...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    Améliorer avec l'IA
                                </>
                            )}
                        </button>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-3 gap-2">
                        {/* Keyboard hints */}
                        <div className="text-xs opacity-75 flex items-center gap-1">
                            <kbd className="bg-white/20 px-2 py-1 rounded text-[10px]">
                                {multiline ? 'Ctrl+Enter' : 'Enter'}
                            </kbd>
                            <span>save</span>
                            <kbd className="bg-white/20 px-2 py-1 rounded text-[10px] ml-2">Esc</kbd>
                            <span>cancel</span>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={onCancel}
                                disabled={isEnhancing}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!validationResult.isValid || isEnhancing}
                                className="px-3 py-1 bg-white text-purple-600 hover:bg-white/90 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Required indicator */}
                    {validation?.required && (
                        <div className="mt-2 text-[10px] opacity-70">
                            * Required field
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
