
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../../application/store/ui-store';
import { cn } from '../../design-system/atoms/Button';
import { User, Briefcase, GraduationCap, Wrench, FileText, Sparkles, TrendingUp, Settings, Wand2 } from 'lucide-react';
import { PersonalTab } from './tabs/PersonalTab';
import { ExperienceTab } from './tabs/ExperienceTab';
import { EducationTab } from './tabs/EducationTab';
import { SkillsTab } from './tabs/SkillsTab';
import { CoverLetterTab } from './tabs/CoverLetterTab';
import { CVImportTab } from './tabs/CVImportTab';
import { CriticTab } from './tabs/CriticTab';
import { SettingsTab } from '../settings/SettingsTab';
import { SystemInsightsTab } from '../system/SystemInsightsTab';

import { useSettingsStore } from '../../../application/store/settings-store';
import { useTranslation } from '../../hooks/useTranslation';

export const EditorSidebar: React.FC = () => {
    const navigate = useNavigate();
    const { activeTab, setActiveTab } = useUIStore();
    const { isMobileMode } = useSettingsStore();
    const { t } = useTranslation();

    const TABS = [
        { id: 'personal', label: t('tabs.personal'), icon: User },
        { id: 'experience', label: t('tabs.experience'), icon: Briefcase },
        { id: 'education', label: t('tabs.education'), icon: GraduationCap },
        { id: 'skills', label: t('tabs.skills'), icon: Wrench },
        { id: 'letter', label: t('tabs.letter'), icon: FileText },
        { id: 'ai', label: t('tabs.ai'), icon: Sparkles },
        { id: 'critic', label: t('tabs.review'), icon: TrendingUp },
        { id: 'settings', label: t('tabs.settings'), icon: Settings },
        // { id: 'system', label: 'Système', icon: Activity }, // Hidden for cleaner UI
    ] as const;

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full lg:w-[450px] shrink-0">
            {/* Tabs Header - Scrollable on Mobile too, but styled differently */}
            <div className={cn(
                "flex overflow-x-auto border-b border-slate-100 no-scrollbar bg-white sticky top-0 z-10",
                isMobileMode ? "py-2" : ""
            )}>
                <button
                    onClick={() => navigate('/wizard')}
                    className="flex-1 min-w-[70px] flex flex-col items-center gap-1 text-[10px] font-medium transition-colors shrink-0 py-3 text-indigo-600 hover:bg-indigo-50 border-b-2 border-transparent"
                    title="Wizard Mode"
                >
                    <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
                        <Wand2 size={18} />
                    </div>
                    <span>Wizard</span>
                </button>
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                'flex-1 min-w-[70px] flex flex-col items-center gap-1 text-[10px] font-medium transition-colors shrink-0',
                                isMobileMode ? "py-2 px-1 rounded-lg mx-1" : "py-3 border-b-2",
                                isActive
                                    ? isMobileMode
                                        ? 'text-indigo-600 bg-indigo-50'
                                        : 'text-indigo-600 border-indigo-600 bg-indigo-50/50'
                                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
                            )}
                        >
                            <Icon size={isMobileMode ? 20 : 18} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
                {activeTab === 'personal' && <PersonalTab />}
                {activeTab === 'experience' && <ExperienceTab />}
                {activeTab === 'education' && <EducationTab />}
                {activeTab === 'skills' && <SkillsTab />}
                {activeTab === 'letter' && <CoverLetterTab />}
                {activeTab === 'ai' && <CVImportTab />}
                {activeTab === 'critic' && <CriticTab />}
                {activeTab === 'settings' && <SettingsTab />}
                {activeTab === 'system' && <SystemInsightsTab />}
            </div>
        </div>
    );
};
