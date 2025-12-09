/**
 * NEXAL STUDIO - Design Panel
 * 
 * Visual design editor for ChameleonTemplateV2.
 * "Paint your CV" experience with real-time updates.
 * 
 * Features:
 * - Color picker with presets (Netflix Red, Spotify Green, etc.)
 * - Typography selector with visual font previews
 * - Header style swapper with thumbnails
 * - Font size and line-height sliders
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
    Pipette
} from 'lucide-react';

import { useDesign, useCVStoreV2 } from '../../../application/store/v2/cv-store-v2';
import {
    COLOR_PRESETS,
    FONT_PAIRINGS_CONFIG,
    type FontPairing,
    type HeaderStyle
} from '../../../application/store/v2/cv-store-v2.types';

// ============================================================================
// TYPES
// ============================================================================

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================

function CollapsibleSection({ title, icon, children, defaultOpen = true }: SectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    {icon}
                    {title}
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
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
                        <div className="px-4 pb-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// COLOR PICKER SECTION
// ============================================================================

function ColorSection() {
    const design = useDesign();
    // Use direct selector to avoid infinite loop from object creation
    const setAccentColor = useCVStoreV2(state => state.setAccentColor);
    const [hexInput, setHexInput] = useState(design.accentColor);

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setHexInput(value);

        // Validate hex format and apply
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
            title="Couleur Principale"
            icon={<Palette className="w-4 h-4" />}
            defaultOpen={true}
        >
            {/* Color Presets Grid */}
            <div className="grid grid-cols-6 gap-2 mb-4">
                {COLOR_PRESETS.map((preset) => (
                    <motion.button
                        key={preset.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetClick(preset.color)}
                        className="relative w-8 h-8 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md"
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                    >
                        {design.accentColor === preset.color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex gap-2 items-center">
                {/* Native Color Picker */}
                <div className="relative">
                    <input
                        type="color"
                        value={design.accentColor}
                        onChange={handleNativeColorPick}
                        className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                    />
                    <div
                        className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                        style={{ backgroundColor: design.accentColor }}
                    >
                        <Pipette className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                </div>

                {/* Hex Input */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={hexInput}
                        onChange={handleHexChange}
                        placeholder="#3b82f6"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
}

// ============================================================================
// TYPOGRAPHY SECTION
// ============================================================================

function TypographySection() {
    const design = useDesign();
    // Use direct selectors to avoid infinite loop
    const setFontPairing = useCVStoreV2(state => state.setFontPairing);
    const setFontSize = useCVStoreV2(state => state.setFontSize);
    const setLineHeight = useCVStoreV2(state => state.setLineHeight);

    return (
        <CollapsibleSection
            title="Typographie"
            icon={<Type className="w-4 h-4" />}
            defaultOpen={true}
        >
            {/* Font Pairing Selector - Visual Preview */}
            <div className="space-y-2 mb-4">
                {(Object.entries(FONT_PAIRINGS_CONFIG) as [FontPairing, typeof FONT_PAIRINGS_CONFIG['sans']][]).map(
                    ([key, config]) => (
                        <motion.button
                            key={key}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setFontPairing(key)}
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${design.fontPairing === key
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div
                                className="text-lg font-bold text-gray-800"
                                style={{ fontFamily: config.heading }}
                            >
                                {config.name}
                            </div>
                            <div
                                className="text-xs text-gray-500 mt-1"
                                style={{ fontFamily: config.body }}
                            >
                                {config.description}
                            </div>
                        </motion.button>
                    )
                )}
            </div>

            {/* Font Size Slider */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Taille</span>
                    <span className="text-xs font-mono text-gray-600">
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>

            {/* Line Height Slider */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Interligne</span>
                    <span className="text-xs font-mono text-gray-600">
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>
        </CollapsibleSection>
    );
}

// ============================================================================
// HEADER SWAPPER SECTION
// ============================================================================

const HEADER_STYLES: { id: HeaderStyle; name: string; description: string }[] = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Gradient, photo ronde, bold'
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Ligne sobre, aligné gauche'
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Épuré, maximum whitespace'
    }
];

function HeaderSection() {
    const design = useDesign();
    // Use direct selector to avoid infinite loop
    const setHeaderStyle = useCVStoreV2(state => state.setHeaderStyle);

    return (
        <CollapsibleSection
            title="Style d'En-tête"
            icon={<Layout className="w-4 h-4" />}
            defaultOpen={false}
        >
            <div className="grid grid-cols-3 gap-2">
                {HEADER_STYLES.map((style) => (
                    <motion.button
                        key={style.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setHeaderStyle(style.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${design.headerStyle === style.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                    >
                        {/* Mini Header Preview */}
                        <div className="mb-2 mx-auto">
                            <HeaderThumbnail
                                style={style.id}
                                accentColor={design.accentColor}
                            />
                        </div>
                        <div className="text-xs font-medium text-gray-700">
                            {style.name}
                        </div>
                    </motion.button>
                ))}
            </div>
        </CollapsibleSection>
    );
}

// Header thumbnail preview component
function HeaderThumbnail({ style, accentColor }: { style: HeaderStyle; accentColor: string }) {
    const baseClasses = "w-full h-10 rounded overflow-hidden";

    switch (style) {
        case 'modern':
            return (
                <div
                    className={baseClasses}
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                    }}
                >
                    <div className="flex items-center h-full px-2 gap-1">
                        <div className="w-4 h-4 rounded-full bg-white/30" />
                        <div className="flex-1 space-y-0.5">
                            <div className="h-1.5 w-8 bg-white/80 rounded" />
                            <div className="h-1 w-6 bg-white/50 rounded" />
                        </div>
                    </div>
                </div>
            );
        case 'classic':
            return (
                <div className={`${baseClasses} bg-white border border-gray-200`}>
                    <div className="flex flex-col justify-center h-full px-2">
                        <div className="h-1.5 w-10 bg-gray-800 rounded mb-0.5" />
                        <div
                            className="h-0.5 w-full rounded"
                            style={{ backgroundColor: accentColor }}
                        />
                    </div>
                </div>
            );
        case 'minimal':
            return (
                <div className={`${baseClasses} bg-white border border-gray-200`}>
                    <div className="flex items-center h-full px-2">
                        <div className="h-2 w-12 bg-gray-300 rounded" />
                    </div>
                </div>
            );
    }
}

// ============================================================================
// MAIN EXPORT: DESIGN STUDIO PANEL
// ============================================================================

interface DesignStudioPanelProps {
    className?: string;
}

export function DesignStudioPanel({ className = '' }: DesignStudioPanelProps) {
    return (
        <div
            className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
        >
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Palette className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-sm text-gray-800">
                        NEXAL STUDIO
                    </span>
                </div>
            </div>

            {/* Panel Content */}
            <div className="divide-y divide-gray-100">
                <ColorSection />
                <TypographySection />
                <HeaderSection />
            </div>
        </div>
    );
}

export default DesignStudioPanel;
