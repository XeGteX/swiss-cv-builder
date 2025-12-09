/**
 * DesignTab v2 - NEXAL Studio Expanded
 * 
 * Advanced design controls with:
 * - 24 Magic Presets (6 categories)
 * - 12 Header Styles
 * - Extended Typography (15+ font pairings)
 * - Visual Details (bullets, lines, icons)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Type,
    Layout,
    ChevronDown,
    ChevronUp,
    Check,
    Pipette,
    Sparkles,
    Grid3X3,
    Sliders
} from 'lucide-react';

import { useDesign, useCVStoreV2 } from '../../../../application/store/v2';
import {
    COLOR_PRESETS,
    FONT_PAIRINGS_CONFIG,
    type FontPairing,
    type HeaderStyle
} from '../../../../application/store/v2/cv-store-v2.types';

import { MAGIC_PRESETS, PRESET_CATEGORIES, type PresetCategory } from '../../../../application/config/studio-presets';
import { HEADER_STYLES_REGISTRY } from '../../../../application/config/header-styles';

// ============================================================================
// COLLAPSIBLE SECTION (Dark Theme)
// ============================================================================

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string;
}

function CollapsibleSection({ title, icon, children, defaultOpen = true, badge }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-white/10 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    {icon}
                    {title}
                    {badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white">
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// MAGIC PRESETS SECTION (24 Presets)
// ============================================================================

function MagicPresetsSection() {
    const setAccentColor = useCVStoreV2(state => state.setAccentColor);
    const setHeaderStyle = useCVStoreV2(state => state.setHeaderStyle);
    const setFontPairing = useCVStoreV2(state => state.setFontPairing);
    const [activeCategory, setActiveCategory] = useState<PresetCategory | 'all'>('all');

    const applyPreset = (preset: typeof MAGIC_PRESETS[0]) => {
        setAccentColor(preset.config.accentColor);
        setHeaderStyle(preset.config.headerStyle);
        setFontPairing(preset.config.fontPairing);
    };

    const filteredPresets = activeCategory === 'all'
        ? MAGIC_PRESETS
        : MAGIC_PRESETS.filter(p => p.category === activeCategory);

    return (
        <CollapsibleSection
            title="Presets Magiques"
            icon={<Sparkles className="w-4 h-4" />}
            defaultOpen={true}
            badge="24"
        >
            {/* Category Tabs */}
            <div className="flex gap-1 mb-3 flex-wrap">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-2 py-1 text-[10px] rounded-md transition-all ${activeCategory === 'all'
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                >
                    Tous
                </button>
                {PRESET_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-2 py-1 text-[10px] rounded-md transition-all ${activeCategory === cat.id
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                    >
                        {cat.emoji} {cat.name}
                    </button>
                ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                {filteredPresets.map((preset) => (
                    <motion.button
                        key={preset.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => applyPreset(preset)}
                        className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all group"
                    >
                        {/* Color Preview Dot */}
                        <div
                            className="w-6 h-6 rounded-full mx-auto mb-1 border-2 border-white/20"
                            style={{ backgroundColor: preset.config.accentColor }}
                        />
                        <span className="text-[10px] font-medium text-slate-300 block truncate">
                            {preset.emoji} {preset.name}
                        </span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 rounded text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {preset.description}
                        </div>
                    </motion.button>
                ))}
            </div>
        </CollapsibleSection>
    );
}

// ============================================================================
// COLOR SECTION
// ============================================================================

function ColorSection() {
    const design = useDesign();
    const setAccentColor = useCVStoreV2(state => state.setAccentColor);
    const [hexInput, setHexInput] = useState(design.accentColor);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setHexInput(value);
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            setAccentColor(value);
        }
    };

    const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setHexInput(color);
        setAccentColor(color);
    };

    const handlePresetClick = (color: string) => {
        setHexInput(color);
        setAccentColor(color);
    };

    return (
        <CollapsibleSection
            title="Couleur d'accent"
            icon={<Palette className="w-4 h-4" />}
            defaultOpen={false}
        >
            {/* Color Presets Grid */}
            <div className="grid grid-cols-6 gap-2 mb-3">
                {COLOR_PRESETS.map((preset) => (
                    <motion.button
                        key={preset.name}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetClick(preset.color)}
                        className="relative w-7 h-7 rounded-lg shadow-sm border border-white/20 transition-all hover:shadow-lg"
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                    >
                        {design.accentColor === preset.color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex gap-2 items-center">
                <div className="relative">
                    <input
                        type="color"
                        value={design.accentColor}
                        onChange={handleNativeColorPick}
                        className="absolute inset-0 opacity-0 cursor-pointer w-9 h-9"
                    />
                    <div
                        className="w-9 h-9 rounded-lg border-2 border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors"
                        style={{ backgroundColor: design.accentColor }}
                    >
                        <Pipette className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                </div>
                <input
                    type="text"
                    value={hexInput}
                    onChange={handleHexChange}
                    placeholder="#3b82f6"
                    className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg font-mono text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                />
            </div>
        </CollapsibleSection>
    );
}

// ============================================================================
// TYPOGRAPHY SECTION
// ============================================================================

function TypographySection() {
    const design = useDesign();
    const setFontPairing = useCVStoreV2(state => state.setFontPairing);
    const setFontSize = useCVStoreV2(state => state.setFontSize);
    const setLineHeight = useCVStoreV2(state => state.setLineHeight);

    return (
        <CollapsibleSection
            title="Typographie"
            icon={<Type className="w-4 h-4" />}
            defaultOpen={false}
        >
            {/* Font Pairing Selector */}
            <div className="space-y-2 mb-4">
                {(Object.entries(FONT_PAIRINGS_CONFIG) as [FontPairing, typeof FONT_PAIRINGS_CONFIG['sans']][]).map(
                    ([key, config]) => (
                        <motion.button
                            key={key}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setFontPairing(key)}
                            className={`w-full p-2.5 rounded-lg border text-left transition-all ${design.fontPairing === key
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-white/10 hover:border-white/20 bg-white/5'
                                }`}
                        >
                            <div
                                className="text-sm font-bold text-slate-200"
                                style={{ fontFamily: config.heading }}
                            >
                                {config.name}
                            </div>
                            <div
                                className="text-xs text-slate-400 mt-0.5"
                                style={{ fontFamily: config.body }}
                            >
                                {config.description}
                            </div>
                        </motion.button>
                    )
                )}
            </div>

            {/* Font Size Slider */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Taille</span>
                    <span className="text-xs font-mono text-slate-300">
                        {Math.round(design.fontSize * 100)}%
                    </span>
                </div>
                <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={design.fontSize}
                    onChange={(e) => setFontSize(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>

            {/* Line Height Slider */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Interligne</span>
                    <span className="text-xs font-mono text-slate-300">
                        {design.lineHeight.toFixed(1)}
                    </span>
                </div>
                <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={design.lineHeight}
                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>
        </CollapsibleSection>
    );
}

// ============================================================================
// HEADER STYLE SECTION (12 Styles)
// ============================================================================

function HeaderSection() {
    const design = useDesign();
    const setHeaderStyle = useCVStoreV2(state => state.setHeaderStyle);

    // Group styles by category
    const stylesByCategory = {
        modern: HEADER_STYLES_REGISTRY.filter(s => s.category === 'modern'),
        classic: HEADER_STYLES_REGISTRY.filter(s => s.category === 'classic'),
        creative: HEADER_STYLES_REGISTRY.filter(s => s.category === 'creative'),
        professional: HEADER_STYLES_REGISTRY.filter(s => s.category === 'professional'),
    };

    return (
        <CollapsibleSection
            title="Style d'en-tête"
            icon={<Layout className="w-4 h-4" />}
            defaultOpen={false}
            badge="12"
        >
            {Object.entries(stylesByCategory).map(([category, styles]) => (
                <div key={category} className="mb-3 last:mb-0">
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                        {category}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {styles.map((style) => (
                            <motion.button
                                key={style.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setHeaderStyle(style.id as HeaderStyle)}
                                className={`p-2 rounded-lg border text-left transition-all ${design.headerStyle === style.id
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                    }`}
                            >
                                <div className="text-[11px] font-medium text-slate-200">
                                    {style.name}
                                </div>
                                <div className="text-[9px] text-slate-500 truncate">
                                    {style.description}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ))}
        </CollapsibleSection>
    );
}

// ============================================================================
// VISUAL DETAILS SECTION (Coming Soon)
// ============================================================================

function VisualDetailsSection() {
    return (
        <CollapsibleSection
            title="Détails visuels"
            icon={<Sliders className="w-4 h-4" />}
            defaultOpen={false}
            badge="SOON"
        >
            <div className="text-center py-4 text-slate-400">
                <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Bientôt: Puces, lignes, icônes</p>
            </div>
        </CollapsibleSection>
    );
}

// ============================================================================
// MAIN EXPORT: DESIGN TAB
// ============================================================================

export function DesignTab() {
    return (
        <div className="space-y-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-200">NEXAL STUDIO</h2>
                    <p className="text-xs text-slate-400">Design en temps réel</p>
                </div>
            </div>

            {/* Controls */}
            <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
                <MagicPresetsSection />
                <ColorSection />
                <TypographySection />
                <HeaderSection />
                <VisualDetailsSection />
            </div>
        </div>
    );
}

export default DesignTab;
