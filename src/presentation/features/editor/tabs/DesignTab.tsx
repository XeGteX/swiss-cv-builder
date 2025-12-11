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
    Sliders,
    PanelLeft,
    PanelRight,
} from 'lucide-react';

import { useDesign, useCVStoreV2 } from '../../../../application/store/v2';
import {
    COLOR_PRESETS,
    FONT_PAIRINGS_CONFIG,
    type FontPairing,
    type HeaderStyle,
    type SidebarPosition,
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
// 🧪 TEST ZONE: SIDEBAR LAYOUT SECTION
// ============================================================================

function SidebarLayoutSection() {
    const design = useDesign();
    const setDesign = useCVStoreV2(state => state.setDesign);

    const handlePositionChange = (position: SidebarPosition) => {
        setDesign({ sidebarPosition: position });
    };

    return (
        <div className="p-3 border-b-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    🧪 TEST ZONE: DISPOSITION
                </span>
            </div>
            <div className="text-[10px] text-slate-400 mb-2">Position de la barre latérale</div>
            <div className="grid grid-cols-2 gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePositionChange('left')}
                    className={`p-3 rounded-lg border-2 text-center transition-all flex flex-col items-center gap-2 ${design.sidebarPosition === 'left'
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                >
                    <PanelLeft className="w-5 h-5 text-slate-200" />
                    <span className="text-xs font-medium text-slate-200">Gauche</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePositionChange('right')}
                    className={`p-3 rounded-lg border-2 text-center transition-all flex flex-col items-center gap-2 ${design.sidebarPosition === 'right'
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                        }`}
                >
                    <PanelRight className="w-5 h-5 text-slate-200" />
                    <span className="text-xs font-medium text-slate-200">Droite</span>
                </motion.button>
            </div>
        </div>
    );
}

// ============================================================================
// MAGIC PRESETS SECTION (24 Presets)
// ============================================================================

function MagicPresetsSection() {
    const setDesign = useCVStoreV2(state => state.setDesign);
    const [activeCategory, setActiveCategory] = useState<PresetCategory | 'all'>('all');

    const applyPreset = (preset: typeof MAGIC_PRESETS[0]) => {
        // Apply all preset config as a full design update
        setDesign({
            accentColor: preset.config.accentColor,
            headerStyle: preset.config.headerStyle,
            fontPairing: preset.config.fontPairing,
            // Apply sidebarPosition if defined in preset
            ...(preset.config.sidebarPosition && { sidebarPosition: preset.config.sidebarPosition }),
        });
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
// VISUAL DETAILS SECTION (Line Style, Bullet Style)
// ============================================================================

function VisualDetailsSection() {
    const design = useDesign();
    const setDesign = useCVStoreV2(state => state.setDesign);

    const lineStyles = [
        { id: 'solid', label: 'Solide', icon: '⎯' },
        { id: 'dashed', label: 'Tirets', icon: '- -' },
        { id: 'dotted', label: 'Points', icon: '···' },
        { id: 'none', label: 'Aucune', icon: '○' },
    ] as const;

    const bulletStyles = [
        { id: 'disc', label: 'Cercle', icon: '•' },
        { id: 'square', label: 'Carré', icon: '▪' },
        { id: 'arrow', label: 'Flèche', icon: '→' },
        { id: 'dash', label: 'Tiret', icon: '–' },
        { id: 'check', label: 'Check', icon: '✓' },
    ] as const;

    return (
        <CollapsibleSection
            title="Détails visuels"
            icon={<Sliders className="w-4 h-4" />}
            defaultOpen={false}
        >
            {/* Section Line Style */}
            <div className="mb-4">
                <div className="text-[10px] text-slate-400 mb-2 font-medium uppercase tracking-wider">
                    Séparateurs de section
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                    {lineStyles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => setDesign({ sectionLineStyle: style.id })}
                            className={`p-2 rounded-lg text-xs transition-all flex flex-col items-center gap-1
                                ${design?.sectionLineStyle === style.id
                                    ? 'bg-white/20 ring-1 ring-white/30'
                                    : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-sm">{style.icon}</span>
                            <span className="text-[9px] text-slate-400">{style.label}</span>
                        </button>
                    ))}
                </div>

                {/* Section Line Color - NEW */}
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Couleur:</span>
                    <button
                        onClick={() => setDesign({ sectionLineColor: 'accent' })}
                        className={`px-2 py-1 text-[10px] rounded transition-all ${design?.sectionLineColor === 'accent'
                            ? 'bg-white/20 ring-1 ring-white/30 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        Accent
                    </button>
                    <div className="relative">
                        <input
                            type="color"
                            value={design?.sectionLineColor === 'accent' ? design?.accentColor : design?.sectionLineColor}
                            onChange={(e) => setDesign({ sectionLineColor: e.target.value })}
                            className="absolute inset-0 opacity-0 cursor-pointer w-6 h-6"
                        />
                        <div
                            className={`w-6 h-6 rounded border-2 cursor-pointer transition-all ${design?.sectionLineColor !== 'accent'
                                ? 'border-white/40'
                                : 'border-white/10'
                                }`}
                            style={{
                                backgroundColor: design?.sectionLineColor === 'accent'
                                    ? design?.accentColor
                                    : design?.sectionLineColor
                            }}
                            title="Couleur personnalisée"
                        />
                    </div>
                    {design?.sectionLineColor !== 'accent' && (
                        <span className="text-[9px] font-mono text-slate-500">
                            {design?.sectionLineColor}
                        </span>
                    )}
                </div>
            </div>

            {/* Bullet Style */}
            <div className="mb-4">
                <div className="text-[10px] text-slate-400 mb-2 font-medium uppercase tracking-wider">
                    Style des puces
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                    {bulletStyles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => setDesign({ bulletStyle: style.id })}
                            className={`p-2 rounded-lg text-lg transition-all flex flex-col items-center gap-0.5
                                ${design?.bulletStyle === style.id
                                    ? 'bg-white/20 ring-1 ring-white/30'
                                    : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <span>{style.icon}</span>
                            <span className="text-[8px] text-slate-400">{style.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Density Hint */}
            <div className="text-[10px] text-slate-400 text-center py-2 opacity-60">
                💡 Ajuste la taille de police dans "Typographie" pour modifier la densité
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
                <SidebarLayoutSection />
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
