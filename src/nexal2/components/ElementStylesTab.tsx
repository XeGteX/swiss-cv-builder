/**
 * NEXAL Platform - Element Styles Tab
 * 
 * UI for selecting per-element variants (skills chips, languages bars, etc.)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, Columns, CircleDot, BarChart3, Flag } from 'lucide-react';
import { useCVStoreV2 } from '@/application/store/v2';
import { getVariantsForElement, type ElementType, type ElementVariantConfig } from '../elements/ElementVariants';

// ============================================================================
// SECTION CONFIG
// ============================================================================

interface ElementSectionConfig {
    id: ElementType;
    name: string;
    icon: React.ReactNode;
}

const ELEMENT_SECTIONS: ElementSectionConfig[] = [
    { id: 'skills', name: 'Compétences', icon: <Grid3X3 className="w-4 h-4" /> },
    { id: 'languages', name: 'Langues', icon: <Flag className="w-4 h-4" /> },
    { id: 'contact', name: 'Contact', icon: <List className="w-4 h-4" /> },
];

// ============================================================================
// VARIANT ICONS
// ============================================================================

const VARIANT_ICONS: Record<string, React.ReactNode> = {
    list: <List className="w-4 h-4" />,
    horizontal: <Columns className="w-4 h-4" />,
    chips: <Grid3X3 className="w-4 h-4" />,
    grid: <Grid3X3 className="w-4 h-4" />,
    progress: <BarChart3 className="w-4 h-4" />,
    dots: <CircleDot className="w-4 h-4" />,
    bars: <BarChart3 className="w-4 h-4" />,
    flags: <Flag className="w-4 h-4" />,
    circles: <CircleDot className="w-4 h-4" />,
    stacked: <List className="w-4 h-4" />,
    inline: <Columns className="w-4 h-4" />,
    icons: <Grid3X3 className="w-4 h-4" />,
};

// ============================================================================
// ELEMENT STYLES TAB
// ============================================================================

export function ElementStylesTab() {
    const [expandedSection, setExpandedSection] = useState<ElementType | null>('skills');

    return (
        <div className="space-y-3 p-4">
            <div className="text-xs uppercase text-slate-500 font-semibold mb-2">
                Styles d'éléments
            </div>

            {ELEMENT_SECTIONS.map(section => (
                <ElementSection
                    key={section.id}
                    config={section}
                    isExpanded={expandedSection === section.id}
                    onToggle={() => setExpandedSection(
                        expandedSection === section.id ? null : section.id
                    )}
                />
            ))}

            <div className="text-xs text-slate-500 mt-4 p-2 bg-slate-800/50 rounded">
                💡 Le style sélectionné affecte le rendu du CV en temps réel.
            </div>
        </div>
    );
}

// ============================================================================
// ELEMENT SECTION
// ============================================================================

interface ElementSectionProps {
    config: ElementSectionConfig;
    isExpanded: boolean;
    onToggle: () => void;
}

function ElementSection({ config, isExpanded, onToggle }: ElementSectionProps) {
    const design = useCVStoreV2((state) => state.design);
    const setElementVariant = useCVStoreV2((state) => state.setElementVariant);
    const variants = getVariantsForElement(config.id);

    // Type-safe access to elementVariants
    const getVariant = (): string => {
        const ev = design.elementVariants;
        if (!ev) return 'list';
        if (config.id === 'skills') return ev.skills || 'list';
        if (config.id === 'languages') return ev.languages || 'list';
        if (config.id === 'contact') return ev.contact || 'stacked';
        return 'list';
    };
    const currentVariant = getVariant();

    const handleSelectVariant = (variantId: string) => {
        if (config.id === 'skills' || config.id === 'languages' || config.id === 'contact') {
            setElementVariant(config.id, variantId);
        }
    };

    if (variants.length === 0) return null;

    return (
        <div className="rounded-lg border border-white/10 overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-2 text-slate-200">
                    {config.icon}
                    <span className="text-sm font-medium">{config.name}</span>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-slate-400"
                >
                    ▼
                </motion.div>
            </button>

            {/* Variants */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    className="p-3 bg-slate-900/50"
                >
                    <div className="grid grid-cols-2 gap-2">
                        {variants.map(variant => (
                            <VariantButton
                                key={variant.id}
                                variant={variant}
                                isSelected={currentVariant === variant.id}
                                onSelect={() => handleSelectVariant(variant.id)}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ============================================================================
// VARIANT BUTTON
// ============================================================================

interface VariantButtonProps {
    variant: ElementVariantConfig;
    isSelected: boolean;
    onSelect: () => void;
}

function VariantButton({ variant, isSelected, onSelect }: VariantButtonProps) {
    const isPdfSupported = variant.supports.includes('pdf');

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`
                p-2.5 rounded-lg border text-left transition-all
                ${isSelected
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }
            `}
        >
            <div className="flex items-center gap-2">
                <div className={`${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                    {VARIANT_ICONS[variant.id] || <List className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">
                        {variant.name}
                    </div>
                    {!isPdfSupported && (
                        <div className="text-[10px] text-amber-500">
                            HTML only
                        </div>
                    )}
                </div>
            </div>
        </motion.button>
    );
}

export default ElementStylesTab;
