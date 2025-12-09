/**
 * NEXAL Career OS - Phase Navigation System
 * 
 * 4-Phase Architecture:
 * 1️⃣ DATA - "Je remplis" (Personal, Experience, Education, Skills, Photo)
 * 2️⃣ DESIGN - "Je rends beau" (Studio, Templates)
 * 3️⃣ INTELLIGENCE - "J'optimise" (Review, Match, Coach)
 * 4️⃣ ACTION - "Je postule" (Letter, Export, Share, Stats)
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
    Database,
    Palette,
    Brain,
    Rocket,
    User,
    Briefcase,
    GraduationCap,
    Wrench,
    Camera,
    Store,
    TrendingUp,
    Target,
    MessageSquare,
    FileText,
    Download,
    Users2,
    BarChart3,
    type LucideIcon
} from 'lucide-react';

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

export type PhaseId = 'data' | 'design' | 'intelligence' | 'action';

export interface PhaseTab {
    id: string;
    label: string;
    icon: LucideIcon;
}

export interface Phase {
    id: PhaseId;
    name: string;
    tagline: string;
    icon: LucideIcon;
    color: string;
    tabs: PhaseTab[];
}

export const PHASES: Phase[] = [
    {
        id: 'data',
        name: 'Data',
        tagline: 'Je remplis',
        icon: Database,
        color: 'from-blue-500 to-cyan-500',
        tabs: [
            { id: 'personal', label: 'Infos', icon: User },
            { id: 'experience', label: 'Expérience', icon: Briefcase },
            { id: 'education', label: 'Formation', icon: GraduationCap },
            { id: 'skills', label: 'Compétences', icon: Wrench },
            { id: 'photo', label: 'Photo', icon: Camera },
        ]
    },
    {
        id: 'design',
        name: 'Design',
        tagline: 'Je rends beau',
        icon: Palette,
        color: 'from-purple-500 to-pink-500',
        tabs: [
            { id: 'design', label: 'Studio', icon: Palette },
            { id: 'marketplace', label: 'Templates', icon: Store },
        ]
    },
    {
        id: 'intelligence',
        name: 'Intelligence',
        tagline: "J'optimise",
        icon: Brain,
        color: 'from-amber-500 to-orange-500',
        tabs: [
            { id: 'critic', label: 'Revue', icon: TrendingUp },
            { id: 'analyzer', label: 'Match', icon: Target },
            { id: 'coach', label: 'Coach', icon: MessageSquare },
        ]
    },
    {
        id: 'action',
        name: 'Action',
        tagline: 'Je postule',
        icon: Rocket,
        color: 'from-emerald-500 to-teal-500',
        tabs: [
            { id: 'letter', label: 'Lettre', icon: FileText },
            { id: 'export', label: 'Export', icon: Download },
            { id: 'collab', label: 'Partage', icon: Users2 },
            { id: 'analytics', label: 'Stats', icon: BarChart3 },
        ]
    }
];

// ============================================================================
// PHASE BAR COMPONENT
// ============================================================================

interface PhaseBarProps {
    activePhase: PhaseId;
    onPhaseChange: (phase: PhaseId) => void;
}

export const PhaseBar: React.FC<PhaseBarProps> = ({ activePhase, onPhaseChange }) => {
    return (
        <div className="flex gap-1 p-1 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
            {PHASES.map((phase) => {
                const isActive = activePhase === phase.id;
                const Icon = phase.icon;

                return (
                    <motion.button
                        key={phase.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onPhaseChange(phase.id)}
                        className={`
                            relative flex-1 py-2 px-3 rounded-lg transition-all duration-300
                            ${isActive
                                ? `bg-gradient-to-r ${phase.color} text-white shadow-lg`
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }
                        `}
                    >
                        <div className="flex flex-col items-center gap-0.5">
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px] font-medium tracking-wide">
                                {phase.name}
                            </span>
                        </div>

                        {/* Active glow effect */}
                        {isActive && (
                            <motion.div
                                layoutId="phase-glow"
                                className={`absolute inset-0 rounded-lg bg-gradient-to-r ${phase.color} opacity-20 blur-md -z-10`}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};

// ============================================================================
// PHASE TABS COMPONENT
// ============================================================================

interface PhaseTabsProps {
    phase: Phase;
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export const PhaseTabs: React.FC<PhaseTabsProps> = ({ phase, activeTab, onTabChange }) => {
    return (
        <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
        >
            {/* Phase Header */}
            <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${phase.color}`}>
                    <phase.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-200">{phase.name}</div>
                    <div className="text-[10px] text-slate-400">{phase.tagline}</div>
                </div>
            </div>

            {/* Tab List */}
            <div className="space-y-0.5">
                {phase.tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <motion.button
                            key={tab.id}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all
                                ${isActive
                                    ? `bg-gradient-to-r ${phase.color} text-white shadow-md`
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{tab.label}</span>

                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
};

// ============================================================================
// HELPERS
// ============================================================================

export function getPhaseForTab(tabId: string): Phase | undefined {
    return PHASES.find(phase => phase.tabs.some(tab => tab.id === tabId));
}

export function getPhaseById(phaseId: PhaseId): Phase | undefined {
    return PHASES.find(phase => phase.id === phaseId);
}

export function getDefaultTabForPhase(phaseId: PhaseId): string {
    const phase = getPhaseById(phaseId);
    return phase?.tabs[0]?.id ?? 'personal';
}
