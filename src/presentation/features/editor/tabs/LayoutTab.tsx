/**
 * LayoutTab - Layout Gallery for "Mise en page" phase
 * 
 * 6 Layout Presets with visual thumbnails and descriptions.
 * Replaces the old "TEST ZONE" approach with a guided UX.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutGrid,
    PanelLeft,
    PanelTop,
    Columns,
    AlignLeft,
    FileText,
    Check,
    Sparkles,
} from 'lucide-react';
import { useDesign, useCVStoreV2 } from '@/application/store/v2';

// PR4: Spotlight Context for contextual preview highlighting
import { useSpotlightTrigger } from '@/nexal2/components';

// ============================================================================
// LAYOUT PRESET DEFINITIONS
// ============================================================================

interface LayoutPreset {
    id: 'SIDEBAR' | 'TOP_HEADER' | 'SPLIT_HEADER' | 'LEFT_RAIL' | 'DUAL_SIDEBAR' | 'ATS_ONE_COLUMN';
    name: string;
    description: string;
    forWho: string;
    icon: React.ReactNode;
    thumbnail: React.ReactNode;
    badge?: string;
}

const LAYOUT_PRESETS: LayoutPreset[] = [
    {
        id: 'SIDEBAR',
        name: 'Sidebar classique',
        description: 'Barre latérale avec photo et infos',
        forWho: 'Profils expérimentés',
        icon: <PanelLeft className="w-5 h-5" />,
        thumbnail: (
            <div className="flex h-full">
                <div className="w-1/3 bg-current opacity-30 rounded-l" />
                <div className="w-2/3 p-1 space-y-0.5">
                    <div className="h-1.5 bg-current opacity-20 rounded w-3/4" />
                    <div className="h-1 bg-current opacity-10 rounded w-full" />
                    <div className="h-1 bg-current opacity-10 rounded w-5/6" />
                </div>
            </div>
        ),
    },
    {
        id: 'TOP_HEADER',
        name: 'En-tête pleine largeur',
        description: 'Header en haut, contenu en dessous',
        forWho: 'Jeunes diplômés',
        icon: <PanelTop className="w-5 h-5" />,
        thumbnail: (
            <div className="flex flex-col h-full">
                <div className="h-1/4 bg-current opacity-30 rounded-t" />
                <div className="flex-1 p-1 space-y-0.5">
                    <div className="h-1 bg-current opacity-10 rounded w-full" />
                    <div className="h-1 bg-current opacity-10 rounded w-5/6" />
                    <div className="h-1 bg-current opacity-10 rounded w-4/5" />
                </div>
            </div>
        ),
    },
    {
        id: 'SPLIT_HEADER',
        name: 'Header + Sidebar',
        description: 'En-tête haut + sidebar',
        forWho: 'Créatifs',
        icon: <Columns className="w-5 h-5" />,
        thumbnail: (
            <div className="flex flex-col h-full">
                <div className="h-1/5 bg-current opacity-30 rounded-t" />
                <div className="flex flex-1">
                    <div className="w-1/4 bg-current opacity-20" />
                    <div className="flex-1 p-1 space-y-0.5">
                        <div className="h-1 bg-current opacity-10 rounded" />
                        <div className="h-1 bg-current opacity-10 rounded w-4/5" />
                    </div>
                </div>
            </div>
        ),
        badge: 'PRO',
    },
    {
        id: 'LEFT_RAIL',
        name: 'Rail mince',
        description: 'Sidebar fine, contenu large',
        forWho: 'Designers',
        icon: <AlignLeft className="w-5 h-5" />,
        thumbnail: (
            <div className="flex h-full">
                <div className="w-1/5 bg-current opacity-30 rounded-l" />
                <div className="flex-1 p-1 space-y-0.5">
                    <div className="h-1.5 bg-current opacity-20 rounded w-1/2" />
                    <div className="h-1 bg-current opacity-10 rounded w-full" />
                    <div className="h-1 bg-current opacity-10 rounded w-full" />
                </div>
            </div>
        ),
    },
    {
        id: 'DUAL_SIDEBAR',
        name: 'Double sidebar',
        description: 'Deux barres latérales',
        forWho: 'Profils très riches',
        icon: <LayoutGrid className="w-5 h-5" />,
        thumbnail: (
            <div className="flex h-full">
                <div className="w-1/5 bg-current opacity-30 rounded-l" />
                <div className="flex-1 p-1 space-y-0.5">
                    <div className="h-1 bg-current opacity-10 rounded" />
                    <div className="h-1 bg-current opacity-10 rounded w-4/5" />
                </div>
                <div className="w-1/5 bg-current opacity-20 rounded-r" />
            </div>
        ),
        badge: 'PRO',
    },
    {
        id: 'ATS_ONE_COLUMN',
        name: 'ATS (1 colonne)',
        description: 'Simple, une colonne',
        forWho: 'Max compatibilité ATS',
        icon: <FileText className="w-5 h-5" />,
        thumbnail: (
            <div className="flex flex-col h-full p-1 space-y-0.5">
                <div className="h-2 bg-current opacity-30 rounded w-1/2 mx-auto" />
                <div className="h-1 bg-current opacity-10 rounded w-full" />
                <div className="h-1 bg-current opacity-10 rounded w-full" />
                <div className="h-1 bg-current opacity-10 rounded w-5/6" />
            </div>
        ),
        badge: 'ATS',
    },
];

// ============================================================================
// SIDEBAR POSITION CONTROL
// ============================================================================

function SidebarPositionControl() {
    const design = useDesign();
    const setDesign = useCVStoreV2(state => state.setDesign);
    const { triggerSpotlight } = useSpotlightTrigger();

    // Only show for layouts that have sidebars
    const hasSidebar = ['SIDEBAR', 'SPLIT_HEADER', 'LEFT_RAIL'].includes(design.layoutPreset || 'SIDEBAR');
    if (!hasSidebar) return null;

    return (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-slate-400 mb-2 font-medium">Position de la sidebar</div>
            <div className="grid grid-cols-2 gap-2">
                {(['left', 'right'] as const).map((pos) => (
                    <button
                        key={pos}
                        onClick={() => {
                            setDesign({ sidebarPosition: pos });
                            // PR4: Trigger spotlight for sidebar zone
                            triggerSpotlight('sidebar', 'Position sidebar');
                        }}
                        className={`p-2 rounded-lg text-center transition-all text-sm ${design.sidebarPosition === pos
                            ? 'bg-blue-500/30 border border-blue-500/50 text-white'
                            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                            }`}
                    >
                        {pos === 'left' ? '◀ Gauche' : 'Droite ▶'}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// MARGINS CONTROL
// ============================================================================

function MarginsControl() {
    const design = useDesign();
    const setDesign = useCVStoreV2(state => state.setDesign);
    const { triggerSpotlight } = useSpotlightTrigger();

    const marginOptions = [
        { id: 'compact', label: 'Serré', description: 'Plus de contenu' },
        { id: 'normal', label: 'Normal', description: 'Équilibré' },
        { id: 'spacious', label: 'Large', description: 'Plus aéré' },
    ] as const;

    // Map margins to actual values (this would affect printable area)
    const currentMargin = design.density === 'compact' ? 'compact'
        : design.density === 'airy' ? 'spacious'
            : 'normal';

    return (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-slate-400 mb-2 font-medium">Marges du document</div>
            <div className="grid grid-cols-3 gap-2">
                {marginOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => {
                            setDesign({
                                density: opt.id === 'compact' ? 'compact'
                                    : opt.id === 'spacious' ? 'airy'
                                        : 'normal'
                            });
                            // PR4: Trigger spotlight for page content
                            triggerSpotlight('page-content', 'Marges');
                        }}
                        className={`p-2 rounded-lg text-center transition-all ${currentMargin === opt.id
                            ? 'bg-blue-500/30 border border-blue-500/50'
                            : 'bg-white/5 border border-white/10 hover:border-white/30'
                            }`}
                    >
                        <div className="text-sm font-medium text-slate-200">{opt.label}</div>
                        <div className="text-[10px] text-slate-500">{opt.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// LAYOUT CARD
// ============================================================================

interface LayoutCardProps {
    preset: LayoutPreset;
    isActive: boolean;
    onClick: () => void;
}

function LayoutCard({ preset, isActive, onClick }: LayoutCardProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative p-3 rounded-xl border-2 text-left transition-all ${isActive
                ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
        >
            {/* Badge */}
            {preset.badge && (
                <div className={`absolute -top-2 -right-2 px-2 py-0.5 text-[9px] font-bold rounded-full ${preset.badge === 'ATS'
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}>
                    {preset.badge}
                </div>
            )}

            {/* Active check */}
            {isActive && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </div>
            )}

            {/* Thumbnail */}
            <div className="h-16 rounded-lg bg-slate-800 mb-2 overflow-hidden text-blue-400">
                {preset.thumbnail}
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-400">{preset.icon}</span>
                <span className="text-sm font-medium text-slate-200">{preset.name}</span>
            </div>
            <div className="text-[11px] text-slate-400 mb-1">{preset.description}</div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {preset.forWho}
            </div>
        </motion.button>
    );
}

// ============================================================================
// MAIN LAYOUT TAB
// ============================================================================

export function LayoutTab() {
    const design = useDesign();
    const setDesign = useCVStoreV2(state => state.setDesign);
    const { triggerSpotlight } = useSpotlightTrigger();

    const currentPreset = design.layoutPreset || 'SIDEBAR';

    const handleSelectPreset = (presetId: LayoutPreset['id']) => {
        setDesign({ layoutPreset: presetId });
        // PR4: Trigger spotlight for full document layout change
        triggerSpotlight('full-document', 'Disposition');
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-200">Mise en page</h2>
                    <p className="text-xs text-slate-400">Choisissez la structure de votre CV</p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-2 gap-3">
                {LAYOUT_PRESETS.map((preset) => (
                    <LayoutCard
                        key={preset.id}
                        preset={preset}
                        isActive={currentPreset === preset.id}
                        onClick={() => handleSelectPreset(preset.id)}
                    />
                ))}
            </div>

            {/* Contextual Controls */}
            <SidebarPositionControl />
            <MarginsControl />

            {/* Tip */}
            <div className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div className="text-xs text-blue-300 font-medium mb-1">💡 Conseil</div>
                <div className="text-[11px] text-slate-400">
                    Le format <strong>ATS (1 colonne)</strong> est recommandé si vous postulez via des portails de recrutement automatisés.
                </div>
            </div>
        </div>
    );
}

export default LayoutTab;
