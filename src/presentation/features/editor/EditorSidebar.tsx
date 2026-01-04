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
import { DesignTab } from './tabs/DesignTab';
import { LayoutTab } from './tabs/LayoutTab';
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
        // Content phase
        case 'personal': return <PersonalTab />;
        case 'experience': return <ExperienceTab />;
        case 'education': return <EducationTab />;
        case 'skills': return <SkillsTab />;
        case 'photo': return <ProfileImageTab />;
        // Design phase
        case 'design': return <DesignTab />;
        // Layout phase (NEW: dedicated LayoutTab)
        case 'layout': return <LayoutTab />;
        // Score IA phase
        case 'analyzer': return <AnalyzerTab />;
        case 'coach': return <CoachTab />;
        // Export phase
        case 'export': return <ExportTab />;
        case 'preflight': return <ExportTab />; // TODO: PreflightTab in PR3
        case 'share': return <CollaborationTab />;
        // Legacy fallback
        case 'letter': return <CoverLetterTab />;
        case 'analytics': return <AnalyticsTab />;
        case 'collab': return <CollaborationTab />;
        case 'marketplace': return <MarketplaceTab />;
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
        currentPhase?.id ?? 'content'  // V3: default to 'content' instead of 'data'
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
            "text-slate-100 rounded-xl border border-white/10",  // REMOVED overflow-hidden
            GlassStyles.panel
        )}>
            {/* Phase Bar - Compact with click dropdowns - MUST BE ABLE TO OVERFLOW */}
            <div className="p-3 border-b border-white/10 bg-slate-900/60 backdrop-blur-md relative z-50">
                <PhaseBar
                    activePhase={activePhaseId}
                    activeTab={activeTab}
                    onPhaseChange={handlePhaseChange}
                    onTabChange={handleTabChange}
                />
            </div>

            {/* Tab Content - Overflow hidden HERE only, not on parent */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar bg-transparent">
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
