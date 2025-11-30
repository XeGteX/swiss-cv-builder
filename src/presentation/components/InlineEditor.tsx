import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';
import type { EditableField } from '../hooks/useInlineEditor';

interface InlineEditorProps {
    isOpen: boolean;
    field: EditableField | null;
    position: { x: number; y: number };
    onSave: (path: string, value: string) => void;
    onCancel: () => void;
    onValueChange: (value: string) => void;
}

const FIELD_CONFIG: Record<string, { placeholder: string; optional: boolean }> = {
    'summary': { placeholder: 'Professional summary describing your experience and goals...', optional: false },
    'personal.firstName': { placeholder: 'First Name', optional: false },
    'personal.lastName': { placeholder: 'Last Name', optional: false },
    'personal.title': { placeholder: 'Job Title', optional: false },
    'personal.birthDate': { placeholder: 'Birth Date', optional: true },
    'personal.nationality': { placeholder: 'Nationality', optional: true },
    'contact.email': { placeholder: 'email@example.com', optional: false },
    'contact.phone': { placeholder: 'Phone Number', optional: true },
    'contact.address': { placeholder: 'Address', optional: true },
};

const getFieldConfig = (path: string): { placeholder: string; optional: boolean } => {
    if (FIELD_CONFIG[path]) return FIELD_CONFIG[path];

    if (path.match(/^skills\[\d+\]$/)) {
        return { placeholder: 'e.g., Python, React, Docker, AWS', optional: true };
    }
    if (path.match(/^languages\[\d+\]\.name$/)) {
        return { placeholder: 'Language name', optional: true };
    }
    if (path.match(/^languages\[\d+\]\.level$/)) {
        return { placeholder: 'Proficiency level', optional: true };
    }

    return { placeholder: 'Enter value...', optional: false };
};

export const InlineEditor: React.FC<InlineEditorProps> = ({
    isOpen,
    field,
    onSave,
    onCancel,
    onValueChange
}) => {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [justOpened, setJustOpened] = useState(false); // Prevent immediate close

    useEffect(() => {
        if (isOpen) {
            // Mark as just opened
            setJustOpened(true);

            // Remove protection after 500ms
            const timer = setTimeout(() => {
                setJustOpened(false);
            }, 500);

            // Focus input
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!field) return null;

    const fieldConfig = getFieldConfig(field.path);
    const isEmpty = !field.value || field.value.trim() === '';

    const handleSave = () => {
        if (isEmpty && fieldConfig.optional) {
            setShowDeleteConfirm(true);
            return;
        }

        const finalValue = isEmpty ? fieldConfig.placeholder : field.value;
        onSave(field.path, finalValue);
        setShowDeleteConfirm(false);
    };

    const handleConfirmDelete = () => {
        onSave(field.path, '');
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        onValueChange(field.value || fieldConfig.placeholder);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && field.type !== 'textarea') {
            e.preventDefault();
            handleSave();
        }
    };

    const isTextarea = field.type === 'textarea';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - protected from immediate close */}
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                        style={{ zIndex: 9998 }}
                        onClick={() => {
                            if (!justOpened) {
                                onCancel();
                            }
                        }}
                    />

                    {/* Editor - PORTAL to body to avoid transform issues */}
                    <div
                        className="fixed inset-0 pointer-events-none flex items-center justify-center"
                        style={{ zIndex: 9999 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="pointer-events-auto"
                            style={{
                                width: isMobile ? 'min(280px, 75vw)' : '500px',
                                maxHeight: isMobile ? 'calc(100vh - 160px)' : 'auto',
                                overflowY: 'auto'
                            }}
                        >
                            <div className={`bg-white rounded-xl shadow-2xl border-2 border-purple-200 ${isMobile ? 'p-2.5' : 'p-4'}`}>
                                {showDeleteConfirm ? (
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-1.5">
                                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={isMobile ? 14 : 18} />
                                            <div>
                                                <h3 className={`font-semibold text-slate-800 ${isMobile ? 'text-[11px]' : 'text-sm'} mb-0.5`}>
                                                    Remove field?
                                                </h3>
                                                <p className={`text-slate-600 ${isMobile ? 'text-[9px]' : 'text-xs'}`}>
                                                    Remove this from your CV?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 justify-end">
                                            <button
                                                onClick={handleCancelDelete}
                                                className={`${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors`}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleConfirmDelete}
                                                className={`${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {field.label && (
                                            <div className={`font-medium text-slate-500 flex items-center gap-1 ${isMobile ? 'text-[10px] mb-1.5' : 'text-xs mb-2'}`}>
                                                <span>✨</span>
                                                <span className="truncate">{field.label}</span>
                                                {fieldConfig.optional && (
                                                    <span className="text-[9px] text-slate-400">(Opt.)</span>
                                                )}
                                            </div>
                                        )}

                                        <div className={isMobile ? 'mb-1.5' : 'mb-2'}>
                                            {isTextarea ? (
                                                <textarea
                                                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                                                    value={field.value}
                                                    onChange={(e) => onValueChange(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder={fieldConfig.placeholder}
                                                    className={`w-full border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none placeholder:text-slate-400 ${isMobile ? 'px-1.5 py-1 text-[11px]' : 'px-3 py-2 text-sm'
                                                        }`}
                                                    rows={isMobile ? 2 : 3}
                                                />
                                            ) : (
                                                <input
                                                    ref={inputRef as React.RefObject<HTMLInputElement>}
                                                    type={field.type}
                                                    value={field.value}
                                                    onChange={(e) => onValueChange(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder={fieldConfig.placeholder}
                                                    className={`w-full border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400 ${isMobile ? 'px-1.5 py-1 text-[11px]' : 'px-3 py-2 text-sm'
                                                        }`}
                                                />
                                            )}
                                        </div>

                                        {isEmpty && !fieldConfig.optional && (
                                            <div className={`text-amber-600 bg-amber-50 rounded-md flex items-center gap-1 ${isMobile ? 'px-1.5 py-1 text-[9px] mb-1' : 'px-2 py-1.5 text-xs mb-2'}`}>
                                                <AlertTriangle size={10} className="shrink-0" />
                                                <span>Uses placeholder if empty</span>
                                            </div>
                                        )}

                                        <div className="flex gap-1.5 justify-end">
                                            <button
                                                onClick={onCancel}
                                                className={`flex items-center gap-0.5 font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors ${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
                                                    }`}
                                            >
                                                <X size={isMobile ? 10 : 12} />
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className={`flex items-center gap-0.5 font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-md transition-colors shadow-sm ${isMobile ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
                                                    }`}
                                            >
                                                <Check size={isMobile ? 10 : 12} />
                                                Save
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
