/**
 * Template Configurator
 * 
 * Filter-based template selection system with:
 * - ATS compatibility toggle
 * - Style selector (minimal, classic, bold, creative)
 * - Font type (serif, sans, mono)
 * - Icons toggle
 * - Color scheme picker
 * - Industry filter
 * 
 * Shows matching templates in real-time
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Check, Sparkles, FileText, Briefcase, Palette, Type, Grid3X3 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateFilters {
    atsCompatible: boolean | null;  // null = any
    style: ('minimal' | 'classic' | 'bold' | 'creative')[];
    fontType: ('serif' | 'sans' | 'mono')[];
    hasIcons: boolean | null;
    colorScheme: ('neutral' | 'vibrant' | 'professional')[];
    industry: string[];
}

export interface TemplateAttributes {
    atsCompatible: boolean;
    hasIcons: boolean;
    style: 'minimal' | 'classic' | 'bold' | 'creative';
    fontType: 'serif' | 'sans' | 'mono';
    colorScheme: 'neutral' | 'vibrant' | 'professional';
    layout: 'single-column' | 'two-column' | 'sidebar';
    industry: string[];
}

interface TemplateConfiguratorProps {
    isOpen: boolean;
    onClose: () => void;
    onFiltersChange: (filters: TemplateFilters) => void;
    currentFilters: TemplateFilters;
    matchCount: number;
}

// ============================================================================
// DEFAULT FILTERS
// ============================================================================

export const DEFAULT_FILTERS: TemplateFilters = {
    atsCompatible: null,
    style: [],
    fontType: [],
    hasIcons: null,
    colorScheme: [],
    industry: []
};

// ============================================================================
// FILTER OPTIONS
// ============================================================================

const STYLE_OPTIONS = [
    { value: 'minimal', label: 'Minimal', icon: '◯' },
    { value: 'classic', label: 'Classique', icon: '▢' },
    { value: 'bold', label: 'Bold', icon: '◆' },
    { value: 'creative', label: 'Créatif', icon: '★' }
];

const FONT_OPTIONS = [
    { value: 'sans', label: 'Sans-Serif', preview: 'Aa' },
    { value: 'serif', label: 'Serif', preview: 'Aa' },
    { value: 'mono', label: 'Mono', preview: 'Aa' }
];

const COLOR_OPTIONS = [
    { value: 'neutral', label: 'Neutre', colors: ['#374151', '#6b7280'] },
    { value: 'professional', label: 'Pro', colors: ['#1e40af', '#1e3a5f'] },
    { value: 'vibrant', label: 'Vibrant', colors: ['#8b5cf6', '#ec4899'] }
];

const INDUSTRY_OPTIONS = [
    { value: 'tech', label: 'Tech' },
    { value: 'finance', label: 'Finance' },
    { value: 'creative', label: 'Créatif' },
    { value: 'legal', label: 'Juridique' },
    { value: 'healthcare', label: 'Santé' },
    { value: 'consulting', label: 'Conseil' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'engineering', label: 'Ingénierie' }
];

// ============================================================================
// COMPONENT
// ============================================================================

export const TemplateConfigurator: React.FC<TemplateConfiguratorProps> = ({
    isOpen,
    onClose,
    onFiltersChange,
    currentFilters,
    matchCount
}) => {
    const toggleArrayFilter = <T extends string>(
        key: keyof TemplateFilters,
        value: T
    ) => {
        const current = currentFilters[key] as T[];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFiltersChange({ ...currentFilters, [key]: updated });
    };

    const toggleBooleanFilter = (key: 'atsCompatible' | 'hasIcons', value: boolean) => {
        const current = currentFilters[key];
        const updated = current === value ? null : value;
        onFiltersChange({ ...currentFilters, [key]: updated });
    };

    const resetFilters = () => {
        onFiltersChange(DEFAULT_FILTERS);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (currentFilters.atsCompatible !== null) count++;
        if (currentFilters.hasIcons !== null) count++;
        if (currentFilters.style.length > 0) count++;
        if (currentFilters.fontType.length > 0) count++;
        if (currentFilters.colorScheme.length > 0) count++;
        if (currentFilters.industry.length > 0) count++;
        return count;
    }, [currentFilters]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        className="relative bg-slate-900 rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-hidden"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Filter size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Configurateur de Template</h2>
                                    <p className="text-sm text-slate-400">
                                        {matchCount} template{matchCount !== 1 ? 's' : ''} correspondant{matchCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            {/* ATS Toggle */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <FileText size={16} className="text-green-400" />
                                    <span>Compatibilité ATS</span>
                                </div>
                                <div className="flex gap-2">
                                    <FilterButton
                                        active={currentFilters.atsCompatible === true}
                                        onClick={() => toggleBooleanFilter('atsCompatible', true)}
                                    >
                                        <Check size={14} /> Compatible ATS
                                    </FilterButton>
                                    <FilterButton
                                        active={currentFilters.atsCompatible === false}
                                        onClick={() => toggleBooleanFilter('atsCompatible', false)}
                                    >
                                        <Sparkles size={14} /> Design avant tout
                                    </FilterButton>
                                </div>
                            </div>

                            {/* Style */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <Palette size={16} className="text-blue-400" />
                                    <span>Style</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {STYLE_OPTIONS.map(opt => (
                                        <FilterButton
                                            key={opt.value}
                                            active={currentFilters.style.includes(opt.value as any)}
                                            onClick={() => toggleArrayFilter('style', opt.value as any)}
                                        >
                                            <span className="text-lg mr-1">{opt.icon}</span>
                                            {opt.label}
                                        </FilterButton>
                                    ))}
                                </div>
                            </div>

                            {/* Font Type */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <Type size={16} className="text-amber-400" />
                                    <span>Police</span>
                                </div>
                                <div className="flex gap-2">
                                    {FONT_OPTIONS.map(opt => (
                                        <FilterButton
                                            key={opt.value}
                                            active={currentFilters.fontType.includes(opt.value as any)}
                                            onClick={() => toggleArrayFilter('fontType', opt.value as any)}
                                            className={opt.value === 'serif' ? 'font-serif' : opt.value === 'mono' ? 'font-mono' : ''}
                                        >
                                            <span className="text-lg font-bold mr-1">{opt.preview}</span>
                                            {opt.label}
                                        </FilterButton>
                                    ))}
                                </div>
                            </div>

                            {/* Color Scheme */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <Grid3X3 size={16} className="text-pink-400" />
                                    <span>Palette de couleurs</span>
                                </div>
                                <div className="flex gap-2">
                                    {COLOR_OPTIONS.map(opt => (
                                        <FilterButton
                                            key={opt.value}
                                            active={currentFilters.colorScheme.includes(opt.value as any)}
                                            onClick={() => toggleArrayFilter('colorScheme', opt.value as any)}
                                        >
                                            <div className="flex gap-1 mr-2">
                                                {opt.colors.map((c, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                            {opt.label}
                                        </FilterButton>
                                    ))}
                                </div>
                            </div>

                            {/* Icons Toggle */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <Sparkles size={16} className="text-cyan-400" />
                                    <span>Icônes</span>
                                </div>
                                <div className="flex gap-2">
                                    <FilterButton
                                        active={currentFilters.hasIcons === true}
                                        onClick={() => toggleBooleanFilter('hasIcons', true)}
                                    >
                                        ✓ Avec icônes
                                    </FilterButton>
                                    <FilterButton
                                        active={currentFilters.hasIcons === false}
                                        onClick={() => toggleBooleanFilter('hasIcons', false)}
                                    >
                                        ✕ Sans icônes
                                    </FilterButton>
                                </div>
                            </div>

                            {/* Industry */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <Briefcase size={16} className="text-emerald-400" />
                                    <span>Secteur</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {INDUSTRY_OPTIONS.map(opt => (
                                        <FilterButton
                                            key={opt.value}
                                            active={currentFilters.industry.includes(opt.value)}
                                            onClick={() => toggleArrayFilter('industry', opt.value)}
                                            size="sm"
                                        >
                                            {opt.label}
                                        </FilterButton>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-900/50">
                            <button
                                onClick={resetFilters}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Réinitialiser {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                            >
                                Voir {matchCount} résultat{matchCount !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// FILTER BUTTON COMPONENT
// ============================================================================

interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md';
}

const FilterButton: React.FC<FilterButtonProps> = ({
    active,
    onClick,
    children,
    className = '',
    size = 'md'
}) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-1 rounded-lg border transition-all
            ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            ${active
                ? 'bg-purple-500/30 border-purple-400 text-purple-200'
                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }
            ${className}
        `}
    >
        {children}
    </button>
);

// ============================================================================
// FILTER UTILITY FUNCTION
// ============================================================================

export function matchesFilters(
    attributes: TemplateAttributes | undefined,
    filters: TemplateFilters
): boolean {
    if (!attributes) return true; // Legacy templates without attributes match all

    // ATS check
    if (filters.atsCompatible !== null && attributes.atsCompatible !== filters.atsCompatible) {
        return false;
    }

    // Icons check
    if (filters.hasIcons !== null && attributes.hasIcons !== filters.hasIcons) {
        return false;
    }

    // Style check
    if (filters.style.length > 0 && !filters.style.includes(attributes.style)) {
        return false;
    }

    // Font check
    if (filters.fontType.length > 0 && !filters.fontType.includes(attributes.fontType)) {
        return false;
    }

    // Color scheme check
    if (filters.colorScheme.length > 0 && !filters.colorScheme.includes(attributes.colorScheme)) {
        return false;
    }

    // Industry check
    if (filters.industry.length > 0) {
        const hasMatch = filters.industry.some(ind => attributes.industry.includes(ind));
        if (!hasMatch) return false;
    }

    return true;
}

export default TemplateConfigurator;
