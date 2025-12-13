/**
 * Phase 7.0 - Inline Edit Overlay
 * 
 * Floating popover editor for inline field editing.
 * Appears near the clicked element.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface InlineEditOverlayProps {
    isOpen: boolean;
    fieldPath: string;
    nodeId: string;
    initialValue: string;
    position: { top: number; left: number };
    onSave: (fieldPath: string, value: string) => void;
    onCancel: () => void;
}

/**
 * Floating popover editor for inline field editing.
 */
export const InlineEditOverlay: React.FC<InlineEditOverlayProps> = ({
    isOpen,
    fieldPath,
    nodeId,
    initialValue,
    position,
    onSave,
    onCancel,
}) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    // Reset value when initialValue changes
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    // Handle keyboard events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSave(fieldPath, value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
        }
    }, [fieldPath, value, onSave, onCancel]);

    // Handle click outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
                onCancel();
            }
        };

        // Delay to avoid immediate close
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    // Determine if this is a multi-line field (summary, tasks)
    const isMultiline = fieldPath === 'summary' || fieldPath.includes('tasks');

    return (
        <div
            ref={overlayRef}
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: 10000,
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                padding: '12px',
                minWidth: '280px',
                maxWidth: '400px',
            }}
        >
            {/* Header */}
            <div style={{
                fontSize: '11px',
                color: '#6B7280',
                marginBottom: '8px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}>
                Editing: <code style={{
                    backgroundColor: '#F3F4F6',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '10px',
                }}>{fieldPath}</code>
            </div>

            {/* Input */}
            {isMultiline ? (
                <textarea
                    ref={inputRef as any}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            onCancel();
                        }
                    }}
                    style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '8px 10px',
                        border: '2px solid #3B82F6',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        resize: 'vertical',
                        outline: 'none',
                    }}
                />
            ) : (
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '2px solid #3B82F6',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        outline: 'none',
                    }}
                />
            )}

            {/* Actions */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '10px'
            }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#F3F4F6',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                >
                    Cancel <span style={{ color: '#9CA3AF', fontSize: '10px' }}>(Esc)</span>
                </button>
                <button
                    onClick={() => onSave(fieldPath, value)}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                >
                    Save <span style={{ color: '#93C5FD', fontSize: '10px' }}>(Enter)</span>
                </button>
            </div>
        </div>
    );
};

export default InlineEditOverlay;
