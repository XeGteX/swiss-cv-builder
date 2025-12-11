/**
 * GhostField - Invisible Editable Field for PDF Overlay
 * 
 * AUTO-CALIBRATED VERSION:
 * - Receives zone with pre-calculated positions from layoutConstants
 * - Scales positions with the PDF viewer scale
 * - Syncs edits to Zustand store in real-time
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCVStoreV2 } from '@/application/store/v2';
import type { FieldZone } from '../shared/layoutConstants';
import { ptToPx } from '../shared/layoutConstants';

interface GhostFieldProps {
    zone: FieldZone;
    scale: number;
    accentColor?: string;
    debug?: boolean;
}

/**
 * Navigate to a nested path in an object
 * Supports: "personal.contact.email", "experiences[0].role", "experiences[1].tasks[2]"
 */
const getValueByPath = (obj: any, path: string): any => {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === undefined || current === null) return '';

        // Handle array notation like "experiences[0]" or "tasks[2]"
        const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
        if (arrayMatch) {
            const [, arrayName, indexStr] = arrayMatch;
            current = current[arrayName]?.[parseInt(indexStr)];
        } else {
            current = current[part];
        }
    }

    return current ?? '';
};

export const GhostField: React.FC<GhostFieldProps> = ({
    zone,
    scale,
    accentColor = '#6366f1',
    debug = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);  // For surgical alignment

    // ═══════════════════════════════════════════════════════════════════════
    // LAZY EDITING: Local state for typing, commit to store only on blur
    // ═══════════════════════════════════════════════════════════════════════
    const [localValue, setLocalValue] = useState('');
    // STRATEGY ZERO: Popover position uses zone coords, not viewport coords

    // Get current value from store (read-only during editing)
    const storeValue = useCVStoreV2((state) => {
        return getValueByPath(state.profile, zone.path);
    });

    const updateField = useCVStoreV2((state) => state.updateField);

    // Sync local value from store when editing starts
    useEffect(() => {
        if (isEditing) {
            setLocalValue(storeValue || '');
        }
    }, [isEditing, storeValue]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (inputRef.current instanceof HTMLInputElement) {
                inputRef.current.select();
            }
        }
    }, [isEditing]);

    const handleClick = useCallback(() => {
        if (zone.type === 'photo') {
            console.log('[GhostField] Photo zone clicked - upload not implemented');
            return;
        }
        setIsEditing(true);
    }, [zone.type]);

    // LAZY: Commit to store only on blur/validate
    // TYPE-AWARE: Parse strings to arrays for skills/languages
    const handleCommit = useCallback(() => {
        if (localValue !== storeValue) {
            // ═══════════════════════════════════════════════════════════════
            // TYPE-AWARE COMMIT: Prevent saving strings to array fields
            // ═══════════════════════════════════════════════════════════════
            if (zone.type === 'skills') {
                // Parse comma-separated string to array
                const skillsArray = localValue
                    .split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
                console.log('[GhostField] Saving skills as array:', skillsArray);
                updateField('skills' as any, skillsArray);
            } else if (zone.type === 'languages') {
                // Parse to Language objects (format: "French - Native, English - Fluent")
                const languagesArray = localValue
                    .split(',')
                    .map(s => {
                        const parts = s.split('-').map(p => p.trim());
                        return { name: parts[0] || '', level: parts[1] || 'Intermédiaire' };
                    })
                    .filter(l => l.name.length > 0);
                console.log('[GhostField] Saving languages as array:', languagesArray);
                updateField('languages' as any, languagesArray);
            } else {
                // Standard text field
                updateField(zone.path as any, localValue);
            }
        }
        setIsEditing(false);
    }, [localValue, storeValue, updateField, zone.path, zone.type]);

    // Local change - NO store update (lazy)
    const handleLocalChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditing(false);  // Discard changes
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleCommit();  // Save changes
        }
    }, [handleCommit]);

    // ═══════════════════════════════════════════════════════════════════════
    // NEXAL GLOW STYLING
    // - Invisible at rest (premium, no debug look)
    // - Glowing cyan/accent border + subtle bg on hover
    // - Smooth 200ms transitions
    // ═══════════════════════════════════════════════════════════════════════

    // Get computed position for magnetic anchoring (passed to parent)
    const zoneRect = {
        x: zone.left * scale,
        y: zone.top * scale,
        width: zone.width * scale,
        height: zone.height * scale,
    };

    const style: React.CSSProperties = {
        position: 'absolute',
        top: zoneRect.y,
        left: zoneRect.x,
        width: zoneRect.width,
        height: zoneRect.height,
        // NEXAL GLOW: Invisible → Glowing on hover
        backgroundColor: isHovered
            ? 'rgba(56, 189, 248, 0.08)'  // sky-400 with low opacity
            : 'transparent',
        border: isHovered
            ? '2px solid rgba(56, 189, 248, 0.6)'  // Glowing cyan border
            : '1px solid transparent',
        borderRadius: 4,
        // Glow effect on hover
        boxShadow: isHovered
            ? '0 0 12px rgba(56, 189, 248, 0.3), inset 0 0 8px rgba(56, 189, 248, 0.1)'
            : 'none',
        cursor: 'pointer',
        // Smooth premium transition
        transition: 'all 0.2s ease-out',
        // Layout
        display: 'flex',
        alignItems: zone.type === 'photo' ? 'center' : 'flex-start',
        justifyContent: zone.type === 'photo' ? 'center' : 'flex-start',
        overflow: 'hidden',
        zIndex: isHovered ? 50 : 10,
        boxSizing: 'border-box',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: `${Math.max(10, 9 * scale)}px`,
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#1f2937',
        padding: '2px 4px',
        resize: 'none',
        lineHeight: 1.4,
    };

    // Render photo zone differently
    if (zone.type === 'photo') {
        return (
            <div
                ref={triggerRef}
                style={style}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
                title="Changer la photo"
            >
                {(isHovered || debug) && (
                    <span style={{ fontSize: 20, opacity: 0.7 }}>📷</span>
                )}
            </div>
        );
    }

    return (
        <>
            {/* Clickable Zone (Ghost Field) with ref for surgical alignment */}
            <div
                ref={triggerRef}
                style={style}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}
            >
                {/* SILENT ZONE - No text content */}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* NEXAL SMART EDITOR - Compact & Precise                              */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {isEditing && (
                <div
                    style={{
                        // ═══════════════════════════════════════════════════════════
                        // STRATEGY ZERO: Position relative to zone, not viewport
                        // No more window.scrollY + getBoundingClientRect madness!
                        // ═══════════════════════════════════════════════════════════
                        position: 'absolute',
                        top: (zone.top + zone.height + 8) * scale,  // 8px below zone
                        left: zone.left * scale,
                        zIndex: 10000,
                        // Counter-scale to maintain readable size
                        transform: scale !== 1 ? `scale(${1 / scale})` : undefined,
                        transformOrigin: 'top left',
                        // Compact size
                        minWidth: 250,
                        maxWidth: 400,
                        width: 350,
                    }}
                >
                    {/* Backdrop - click to close */}
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: -1,
                            backdropFilter: 'blur(4px)',
                        }}
                        onClick={handleCommit}  // Click outside saves changes
                    />

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* NEXAL EDITOR V2 - Elastic & Modern                      */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div
                        style={{
                            backgroundColor: '#0f172a',  // slate-900
                            borderRadius: 16,  // rounded-xl
                            border: '1px solid #334155',  // slate-700
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.3)',  // shadow-2xl
                            overflow: 'hidden',
                            minWidth: 300,
                        }}
                    >
                        {/* Header - Minimal */}
                        <div
                            style={{
                                padding: '14px 18px',
                                borderBottom: '1px solid #1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'linear-gradient(to right, #0f172a, #1e293b)',
                            }}
                        >
                            <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>
                                {zone.placeholder || 'Modifier'}
                            </span>
                            <button
                                onClick={() => setIsEditing(false)}  // X just closes, no save
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: '#94a3b8',
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Editor Area - Compact */}
                        <div style={{ padding: 14 }}>
                            <textarea
                                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                                value={localValue}
                                onChange={handleLocalChange}
                                onKeyDown={handleKeyDown}
                                placeholder={zone.placeholder}
                                rows={3}
                                style={{
                                    width: '100%',
                                    minHeight: 60,
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    color: '#f1f5f9',
                                    fontSize: 14,
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    lineHeight: 1.5,
                                    resize: 'none',  // Disable manual resize
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div
                            style={{
                                padding: '12px 16px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ color: '#64748b', fontSize: 11 }}>
                                Ctrl+Entrée pour valider
                            </span>
                            <button
                                onClick={handleCommit}  // LAZY: Save to store on click
                                style={{
                                    backgroundColor: accentColor,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '8px 16px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Valider ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GhostField;
