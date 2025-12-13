/**
 * Phase 7.1 - Structure Panel
 * 
 * Collapsible panel for section ordering, visibility, and limits.
 * Uses HTML5 Drag and Drop for reordering.
 */

import React, { useState, useCallback } from 'react';
import { useCVStoreV2 } from '@/application/store/v2/cv-store-v2';
import {
    DEFAULT_STRUCTURE,
    type StructureConfig,
    type SectionId
} from '@/application/store/v2/cv-store-v2.types';
import { Eye, EyeOff, GripVertical, Settings2 } from 'lucide-react';

/** Section display names */
const SECTION_LABELS: Record<SectionId, string> = {
    identity: 'Identité',
    contact: 'Contact',
    summary: 'Résumé',
    skills: 'Compétences',
    languages: 'Langues',
    experiences: 'Expériences',
    educations: 'Formation',
};

interface StructurePanelProps {
    className?: string;
}

export const StructurePanel: React.FC<StructurePanelProps> = ({ className }) => {
    const design = useCVStoreV2((state) => state.design);
    const setDesign = useCVStoreV2((state) => state.setDesign);

    // Local state for DnD
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Get structure config with defaults
    const structure: StructureConfig = {
        ...DEFAULT_STRUCTURE,
        ...design?.structure,
        visible: { ...DEFAULT_STRUCTURE.visible, ...design?.structure?.visible },
        limits: { ...DEFAULT_STRUCTURE.limits, ...design?.structure?.limits },
    };

    // Update structure in store
    const updateStructure = useCallback((updates: Partial<StructureConfig>) => {
        setDesign({
            structure: {
                ...structure,
                ...updates,
            },
        });
    }, [structure, setDesign]);

    // Toggle section visibility
    const toggleVisibility = useCallback((sectionId: SectionId) => {
        updateStructure({
            visible: {
                ...structure.visible,
                [sectionId]: !structure.visible[sectionId],
            },
        });
    }, [structure, updateStructure]);

    // Update limit
    const updateLimit = useCallback((key: keyof StructureConfig['limits'], value: number) => {
        updateStructure({
            limits: {
                ...structure.limits,
                [key]: Math.max(1, Math.min(99, value)),
            },
        });
    }, [structure, updateStructure]);

    // DnD handlers
    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const newOrder = [...structure.order];
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);

        updateStructure({ order: newOrder });
        setDraggedIndex(null);
    }, [draggedIndex, structure, updateStructure]);

    const handleDragEnd = useCallback(() => {
        setDraggedIndex(null);
    }, []);

    // Limits summary
    const limitsText = `${structure.limits.skillsTopN}/${structure.limits.languagesTopN}/${structure.limits.experiencesTopN}/${structure.limits.tasksTopN}/${structure.limits.educationsTopN}`;
    const isDefaultLimits = limitsText === '12/6/5/4/4';

    return (
        <details className={`text-[10px] bg-slate-900/95 border border-slate-700 rounded p-2 ${className || ''}`}>
            <summary className="cursor-pointer text-cyan-400 font-bold flex items-center gap-1">
                <Settings2 size={12} />
                Structure Mode
            </summary>

            <div className="mt-2 space-y-2">
                {/* Section list with DnD */}
                <div className="space-y-1">
                    {structure.order.map((sectionId, index) => (
                        <div
                            key={sectionId}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center gap-1 px-1 py-0.5 rounded border transition-colors ${draggedIndex === index
                                    ? 'border-cyan-500 bg-cyan-900/30'
                                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                                }`}
                        >
                            {/* Drag handle */}
                            <GripVertical
                                size={12}
                                className="text-slate-500 cursor-grab flex-shrink-0"
                            />

                            {/* Section name */}
                            <span className={`flex-1 ${structure.visible[sectionId] ? 'text-slate-200' : 'text-slate-500 line-through'
                                }`}>
                                {SECTION_LABELS[sectionId]}
                            </span>

                            {/* Visibility toggle */}
                            <button
                                onClick={() => toggleVisibility(sectionId)}
                                className={`p-0.5 rounded ${structure.visible[sectionId]
                                        ? 'text-emerald-400 hover:bg-emerald-900/30'
                                        : 'text-slate-500 hover:bg-slate-700'
                                    }`}
                                title={structure.visible[sectionId] ? 'Masquer' : 'Afficher'}
                            >
                                {structure.visible[sectionId] ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Limits summary / Advanced toggle */}
                <div className="border-t border-slate-700 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">
                            Limites: {isDefaultLimits ? 'défaut' : limitsText}
                        </span>
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300"
                        >
                            {showAdvanced ? '▼ Masquer' : '▶ Avancé'}
                        </button>
                    </div>

                    {/* Advanced limits controls */}
                    {showAdvanced && (
                        <div className="mt-2 space-y-1 text-[9px]">
                            {([
                                ['skillsTopN', 'Skills max'],
                                ['languagesTopN', 'Langues max'],
                                ['experiencesTopN', 'Expériences max'],
                                ['tasksTopN', 'Tâches/exp max'],
                                ['educationsTopN', 'Formations max'],
                            ] as const).map(([key, label]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-slate-400">{label}</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={99}
                                        value={structure.limits[key]}
                                        onChange={(e) => updateLimit(key, parseInt(e.target.value) || 1)}
                                        className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-slate-200 text-center"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </details>
    );
};

export default StructurePanel;
