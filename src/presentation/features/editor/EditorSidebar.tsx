/**
 * EditorSidebar v3 - Compact Phase Navigation
 * 
 * REFACTORED: Hover dropdown submenus, cleaner UI
 * No more permanent tabs list - dropdowns on hover
 */

import React, { useState, useCallback } from 'react';
import { useUIStore } from '../../../application/store/ui-store';
import { cn } from '../../design-system/atoms/Button';
import { motion, AnimatePresence } from 'framer-motion';

// Phase Navigation System
import {
    PHASES,
    PhaseBar,
    getPhaseForTab,
    type PhaseId
} from '../../components/PhaseNavigation';

// Tab Components
import { PersonalTab } from './tabs/PersonalTab';
import { ExperienceTab } from './tabs/ExperienceTab';
import { EducationTab } from './tabs/EducationTab';
import { SkillsTab } from './tabs/SkillsTab';
import { CoverLetterTab } from './tabs/CoverLetterTab';
import { CriticTab } from './tabs/CriticTab';
import { DesignTab } from './tabs/DesignTab';
import { CoachTab } from './tabs/CoachTab';
import { AnalyzerTab } from './tabs/AnalyzerTab';
import { ExportTab } from './tabs/ExportTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { CollaborationTab } from './tabs/CollaborationTab';
import { MarketplaceTab } from './tabs/MarketplaceTab';
import { ProfileImageTab } from './tabs/ProfileImageTab';
import { GlassStyles } from '../../design-system/tokens';

// ============================================================================
// TAB CONTENT RENDERER
// ============================================================================

const TabContent: React.FC<{ tabId: string }> = React.memo(({ tabId }) => {
    switch (tabId) {
        case 'personal': return <PersonalTab />;
        case 'experience': return <ExperienceTab />;
        case 'education': return <EducationTab />;
        case 'skills': return <SkillsTab />;
        case 'letter': return <CoverLetterTab />;
        case 'critic': return <CriticTab />;
        case 'design': return <DesignTab />;
        case 'analyzer': return <AnalyzerTab />;
        case 'export': return <ExportTab />;
        case 'analytics': return <AnalyticsTab />;
        case 'collab': return <CollaborationTab />;
        case 'marketplace': return <MarketplaceTab />;
        case 'coach': return <CoachTab />;
        case 'photo': return <ProfileImageTab />;
        default: return <PersonalTab />;
    }
});

TabContent.displayName = 'TabContent';

// ============================================================================
// EDITOR SIDEBAR COMPONENT - COMPACT VERSION
// ============================================================================

export const EditorSidebar: React.FC = React.memo(() => {
    const { activeTab, setActiveTab } = useUIStore();

    // Derive active phase from active tab
    const currentPhase = getPhaseForTab(activeTab);
    const [activePhaseId, setActivePhaseId] = useState<PhaseId>(
        currentPhase?.id ?? 'data'
    );

    // Handle phase change
    const handlePhaseChange = useCallback((phaseId: PhaseId) => {
        setActivePhaseId(phaseId);
    }, []);

    // Handle tab change
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId as any);
        // Also update phase to match
        const phase = getPhaseForTab(tabId);
        if (phase) setActivePhaseId(phase.id);
    }, [setActiveTab]);

    return (
        <div className={cn(
            "flex flex-col h-full w-full lg:min-w-[450px] lg:max-w-[550px] shrink-0",
            "text-slate-100 rounded-xl border border-white/10 overflow-hidden",
            GlassStyles.panel
        )}>
            {/* Phase Bar - Compact with hover dropdowns */}
            <div className="p-3 border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
                <PhaseBar
                    activePhase={activePhaseId}
                    activeTab={activeTab}
                    onPhaseChange={handlePhaseChange}
                    onTabChange={handleTabChange}
                />
            </div>

            {/* Tab Content - Takes all remaining space */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-transparent">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <TabContent tabId={activeTab} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
});

EditorSidebar.displayName = 'EditorSidebar';
