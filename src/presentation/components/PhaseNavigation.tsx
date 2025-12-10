/**
 * NEXAL Career OS - Phase Navigation System v2
 * 
 * REFACTORED: Hover-to-show submenus, click-to-select-and-close
 * 
 * 4-Phase Architecture:
 * 1️⃣ DATA - Personal, Experience, Education, Skills, Photo
 * 2️⃣ DESIGN - Studio, Templates
 * 3️⃣ INTELLIGENCE - Review, Match, Coach
 * 4️⃣ ACTION - Letter, Export, Share, Stats
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    ChevronDown,
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
// PHASE BAR WITH HOVER DROPDOWN - COMPACT VERSION
// ============================================================================

interface PhaseBarProps {
    activePhase: PhaseId;
    activeTab: string;
    onPhaseChange: (phase: PhaseId) => void;
    onTabChange: (tabId: string) => void;
}

export const PhaseBar: React.FC<PhaseBarProps> = ({
    activePhase,
    activeTab,
    onPhaseChange,
    onTabChange
}) => {
    const [hoveredPhase, setHoveredPhase] = useState<PhaseId | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setDropdownOpen(false);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleMouseEnter = useCallback((phaseId: PhaseId) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredPhase(phaseId);
        setDropdownOpen(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
            setHoveredPhase(null);
        }, 200);
    }, []);

    const handleTabClick = useCallback((e: React.MouseEvent, phaseId: PhaseId, tabId: string) => {
        e.stopPropagation();
        onPhaseChange(phaseId);
        onTabChange(tabId);
        setDropdownOpen(false);
        setHoveredPhase(null);
    }, [onPhaseChange, onTabChange]);

    const currentPhase = PHASES.find(p => p.id === (hoveredPhase || activePhase));
    const currentTab = currentPhase?.tabs.find(t => t.id === activeTab);

    return (
        <div
            className="relative"
            onMouseLeave={handleMouseLeave}
        >
            {/* Phase Buttons Row */}
            <div className="flex gap-1 p-1 bg-black/20 rounded-xl backdrop-blur-sm border border-white/10">
                {PHASES.map((phase) => {
                    const isActive = activePhase === phase.id;
                    const isHovered = hoveredPhase === phase.id;
                    const Icon = phase.icon;

                    return (
                        <motion.button
                            key={phase.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPhaseChange(phase.id);
                            }}
                            onMouseEnter={() => handleMouseEnter(phase.id)}
                            className={`
                                relative flex-1 py-2 px-3 rounded-lg transition-all duration-300
                                ${isActive
                                    ? `bg-gradient-to-r ${phase.color} text-white shadow-lg`
                                    : isHovered
                                        ? 'bg-white/10 text-slate-200'
                                        : 'text-slate-400 hover:text-slate-200'
                                }
                            `}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                <Icon className="w-4 h-4" />
                                <span className="text-[10px] font-medium tracking-wide">
                                    {phase.name}
                                </span>
                            </div>

                            {/* Hover indicator arrow */}
                            {isHovered && dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                                >
                                    <ChevronDown className="w-3 h-3 text-white/60" />
                                </motion.div>
                            )}

                            {/* Active glow */}
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

            {/* Dropdown Menu - Shows on hover */}
            <AnimatePresence>
                {dropdownOpen && hoveredPhase && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-1 p-1.5 bg-slate-900/95 backdrop-blur-md rounded-lg border border-white/10 shadow-xl z-[9999]"
                        onMouseEnter={() => {
                            if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        }}
                    >
                        <div className="flex flex-wrap gap-1">
                            {currentPhase?.tabs.map((tab) => {
                                const isActiveTab = activeTab === tab.id && activePhase === hoveredPhase;
                                const TabIcon = tab.icon;

                                return (
                                    <motion.button
                                        key={tab.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={(e) => handleTabClick(e, hoveredPhase!, tab.id)}
                                        className={`
                                            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
                                            ${isActiveTab
                                                ? `bg-gradient-to-r ${currentPhase.color} text-white`
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                            }
                                        `}
                                    >
                                        <TabIcon className="w-3.5 h-3.5" />
                                        {tab.label}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Tab Indicator - Shows current selection compactly */}
            {currentTab && !dropdownOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-400"
                >
                    <currentTab.icon className="w-3 h-3" />
                    <span>{currentTab.label}</span>
                </motion.div>
            )}
        </div>
    );
};

// ============================================================================
// LEGACY PHASE TABS - Keep for backward compatibility but simplified
// ============================================================================

interface PhaseTabsProps {
    phase: Phase;
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export const PhaseTabs: React.FC<PhaseTabsProps> = ({ phase, activeTab, onTabChange }) => {
    // Simplified version - no header, just compact tabs
    return (
        <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex flex-wrap gap-1"
        >
            {phase.tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${isActive
                                ? `bg-gradient-to-r ${phase.color} text-white shadow-md`
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </motion.button>
                );
            })}
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
