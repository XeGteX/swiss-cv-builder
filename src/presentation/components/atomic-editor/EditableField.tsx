/**
 * CV Engine v2 - Editable Field Component
 * 
 * Self-contained wrapper that makes any content editable.
 * NO data-* attributes needed - all logic is encapsulated.
 * 
 * TELEKINESIS: Mode-aware - blocks editing in structure mode
 * 
 * @example
 * <EditableField path="personal.firstName" label="First Name" required>
 *   {(value) => <h1 className="text-5xl">{value}</h1>}
 * </EditableField>
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useFieldValue, useUpdateField, useMode } from '../../../application/store/v2';
import { useSettingsStore } from '../../../application/store/settings-store';
import { useDebugStore, getSeverityColor } from '../../../application/store/debug-store';
import { EditorOverlay } from './EditorOverlay';
import type { ValidationRule } from './validators';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface EditableFieldProps<T = string> {
    /**
     * Path to the field in the CV profile
     * e.g., "personal.firstName" or "experiences.0.role"
     */
    path: string;

    /**
     * Label to show in the editor overlay
     */
    label: string;

    /**
     * Placeholder text for empty fields
     */
    placeholder?: string;

    /**
     * Validation rules
     */
    validation?: ValidationRule;

    /**
     * Use multiline textarea for long text
     */
    multiline?: boolean;

    /**
     * Enable AI enhancement (Prometheus)
     */
    aiEnabled?: boolean;

    /**
     * Transform value before saving (e.g., trim, uppercase)
     */
    transform?: (value: T) => T;

    /**
     * Render function - receives current value
     */
    children: (value: T) => React.ReactNode;

    /**
     * Optional className for the wrapper
     */
    className?: string;

    /**
     * Disable editing
     */
    disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EditableField<T = string>({
    path,
    label,
    placeholder = '',
    validation,
    multiline = false,
    aiEnabled = false,
    transform,
    children,
    className,
    disabled = false
}: EditableFieldProps<T>) {
    // State
    const [isEditing, setIsEditing] = useState(false);
    const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });

    // Store hooks
    const value = useFieldValue<T>(path);
    const updateField = useUpdateField();
    const mode = useMode(); // TELEKINESIS - Mode awareness
    const location = useLocation();
    const { setFocusMode } = useSettingsStore();

    // Block editing on templates page
    const isOnTemplatesPage = location.pathname === '/templates';

    // Debug mode - get issues for this field with stable reference
    const isDebugMode = useDebugStore(s => s.isDebugMode);
    const allIssues = useDebugStore(s => s.issues);

    const issues = useMemo(() => {
        if (!isDebugMode) return [];
        const matched = allIssues.filter(i => i.field === path || i.field.startsWith(path + '.'));
        // Log ALL fields when debug mode is active to trace rendering
        if (isDebugMode && matched.length > 0) {
            console.log(`[EditableField] ✅ path="${path}" MATCHED ${matched.length} issue(s)`);
        }
        return matched;
    }, [isDebugMode, allIssues, path]);

    // Debug: Log when skills EditableField renders
    React.useEffect(() => {
        if (path.startsWith('skills.') && isDebugMode) {
            console.log(`[EditableField] 🔄 RENDER: path="${path}" isDebugMode=${isDebugMode} issues=${allIssues.filter(i => i.field === path).length}`);
        }
    }, [path, isDebugMode, allIssues]);

    const hasIssues = issues.length > 0;
    const highestSeverity = useMemo(() => {
        if (!hasIssues) return null;
        return issues.reduce<'critical' | 'warning' | 'improvement' | 'info'>((acc, i) => {
            const order = { critical: 4, warning: 3, improvement: 2, info: 1 };
            return order[i.severity] > order[acc] ? i.severity : acc;
        }, 'info');
    }, [issues, hasIssues]);
    const issueColors = highestSeverity ? getSeverityColor(highestSeverity) : null;

    // ========================================
    // HANDLERS
    // ========================================

    /**
     * Handle double click - open editor overlay
     * DISCIPLINE: Block editing in structure mode
     */
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        // TELEKINESIS - Prevent editing when arranging layout
        if (mode === 'structure') return;

        // Prevent editing on templates page
        if (isOnTemplatesPage) return;

        if (disabled) return;

        e.stopPropagation();

        // Calculate position - use center of element for better positioning
        const rect = e.currentTarget.getBoundingClientRect();
        setEditorPosition({
            x: rect.left + rect.width / 2,  // Center of element
            y: rect.bottom + 8
        });

        setIsEditing(true);
        setFocusMode(true); // Auto-hide sidebar
    }, [disabled, mode, isOnTemplatesPage, setFocusMode]);

    /**
     * Handle save
     */
    const handleSave = useCallback((newValue: string) => {
        let processedValue: any = newValue;

        // Apply transform if provided
        if (transform) {
            processedValue = transform(processedValue as T);
        }

        // Update store
        updateField(path, processedValue);

        // Close editor
        setIsEditing(false);
    }, [path, updateField, transform]);

    /**
     * Handle AI enhancement (Project Prometheus)
     */
    const handleAIEnhance = useCallback(async (currentValue: string): Promise<string> => {
        // Import AIService dynamically to avoid circular deps
        const { AIService } = await import('../../../application/services/ai-service');
        const { BackendAIClient } = await import('../../../infrastructure/ai/backend-ai-client');

        // Create AI client and service
        const aiClient = new BackendAIClient();
        const aiService = new AIService(aiClient);

        // Improve text with context from label
        const improved = await aiService.improveText(currentValue, label);
        return improved;
    }, [label]);

    /**
     * Handle cancel
     */
    const handleCancel = useCallback(() => {
        setIsEditing(false);
    }, []);

    // ========================================
    // RENDER
    // ========================================

    // Display value (use placeholder if empty)
    const displayValue = (value || placeholder) as T;
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '');

    return (
        <>
            {/* Editable wrapper */}
            <div
                onDoubleClick={handleDoubleClick}
                className={`
                    ${className || ''}
                    ${!disabled && !isOnTemplatesPage ? 'cursor-pointer transition-all duration-200' : ''}
                    ${!disabled && !isOnTemplatesPage ? 'hover:outline hover:outline-2 hover:outline-purple-400/40 hover:outline-offset-2 hover:bg-purple-50/30 hover:rounded' : ''}
                    ${isEmpty ? 'min-h-[1.5em] min-w-[80px]' : ''}
                `}
                style={hasIssues && issueColors ? {
                    boxShadow: `inset 0 0 0 2px ${issueColors.border}`,
                    borderRadius: '2px',
                    backgroundColor: issueColors.bg,
                } : undefined}
                title={hasIssues ? issues[0].message : (!disabled && !isOnTemplatesPage ? 'Double-click to edit' : undefined)}
            >
                {isEmpty ? (
                    <span className="text-gray-400 italic text-sm">
                        [Ajouter {label}]
                    </span>
                ) : (
                    children(displayValue)
                )}
            </div>

            {/* Editor overlay */}
            <EditorOverlay
                isOpen={isEditing}
                position={editorPosition}
                value={String(value || '')}
                label={label}
                placeholder={placeholder}
                multiline={multiline}
                validation={validation}
                aiEnabled={aiEnabled}
                onSave={handleSave}
                onCancel={handleCancel}
                onAIEnhance={aiEnabled ? handleAIEnhance : undefined}
            />
        </>
    );
}

// ============================================================================
// PRESET VARIANTS (Convenience wrappers)
// ============================================================================

/**
 * Editable text field (single line)
 */
export const EditableText: React.FC<Omit<EditableFieldProps<string>, 'multiline'>> = (props) => (
    <EditableField {...props} multiline={false} />
);

/**
 * Editable textarea field (multiline)
 */
export const EditableTextarea: React.FC<Omit<EditableFieldProps<string>, 'multiline'>> = (props) => (
    <EditableField {...props} multiline={true} />
);

/**
 * Editable email field (with validation)
 */
export const EditableEmail: React.FC<Omit<EditableFieldProps<string>, 'validation'>> = (props) => (
    <EditableField
        {...props}
        validation={{ required: true, email: true }}
    />
);

/**
 * Editable phone field (with validation)
 */
export const EditablePhone: React.FC<Omit<EditableFieldProps<string>, 'validation'>> = (props) => (
    <EditableField
        {...props}
        validation={{ phone: true }}
    />
);
