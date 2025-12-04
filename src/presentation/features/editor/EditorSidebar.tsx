import React from 'react';
import { useUIStore } from '../../../application/store/ui-store';
import { cn } from '../../design-system/atoms/Button';
import { User, Briefcase, GraduationCap, Wrench, FileText, TrendingUp } from 'lucide-react';
import { PersonalTab } from './tabs/PersonalTab';
import { ExperienceTab } from './tabs/ExperienceTab';
import { EducationTab } from './tabs/EducationTab';
import { SkillsTab } from './tabs/SkillsTab';
import { CoverLetterTab } from './tabs/CoverLetterTab';
import { CriticTab } from './tabs/CriticTab';
import { SystemInsightsTab } from '../system/SystemInsightsTab';
import { GlassStyles } from '../../design-system/tokens';

import { useSettingsStore } from '../../../application/store/settings-store';
import { useTranslation } from '../../hooks/useTranslation';

export const EditorSidebar: React.FC = React.memo(() => {
    const { activeTab, setActiveTab } = useUIStore();
    const { isMobileMode } = useSettingsStore();
    const { t } = useTranslation();

    const TABS = [
        { id: 'personal', label: t('tabs.personal'), icon: User },
        { id: 'experience', label: t('tabs.experience'), icon: Briefcase },
        { id: 'education', label: t('tabs.education'), icon: GraduationCap },
        { id: 'skills', label: t('tabs.skills'), icon: Wrench },
        { id: 'letter', label: t('tabs.letter'), icon: FileText },
        { id: 'critic', label: t('tabs.review'), icon: TrendingUp },
        // NOTE: 'ai' and 'settings' removed - now handled by SmartSidebar (Option A)
        // { id: 'system', label: 'Système', icon: Activity }, // Hidden for cleaner UI
    ] as const;

    return (
        <div className={cn("flex flex-col h-full w-full lg:min-w-[450px] lg:max-w-[550px] shrink-0 text-slate-100 rounded-xl border border-white/10 overflow-hidden", GlassStyles.panel)}>
            {/* Tabs Header - Grid layout, no horizontal scroll */}
            <div className={cn(
                "grid grid-cols-3 gap-1 border-b border-white/10 sticky top-0 z-10 p-2 bg-slate-900/80 backdrop-blur-md",
                isMobileMode ? "grid-cols-2" : ""
            )}>
                {/* Wizard button removed - now in SmartSidebar (Option A) */}
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                'flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg text-[11px] font-medium transition-all duration-200',
                                isActive
                                    ? 'text-white bg-white/10 shadow-lg scale-105 border border-white/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:shadow-sm'
                            )}
                        >
                            <Icon size={isMobileMode ? 20 : 18} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-transparent">
                {activeTab === 'personal' && <PersonalTab />}
                {activeTab === 'experience' && <ExperienceTab />}
                {activeTab === 'education' && <EducationTab />}
                {activeTab === 'skills' && <SkillsTab />}
                {activeTab === 'letter' && <CoverLetterTab />}
                {activeTab === 'critic' && <CriticTab />}
                {/* 'ai' and 'settings' tabs removed */}
                {activeTab === 'system' && <SystemInsightsTab />}
            </div>
        </div>
    );
});
