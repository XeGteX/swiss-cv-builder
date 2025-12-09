/**
 * MobileEditor - Mobile-optimized CV Editor Component
 * 
 * A streamlined editor experience for mobile devices.
 * Re-exports EditorSidebar content in a mobile-friendly format.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, GraduationCap, FileText, TrendingUp, Settings } from 'lucide-react';
import { useUIStore } from '../../../application/store/ui-store';
import { useTranslation } from '../../hooks/useTranslation';

// Import tab content components
import { PersonalTab } from './tabs/PersonalTab';
import { ExperienceTab } from './tabs/ExperienceTab';
import { EducationTab } from './tabs/EducationTab';
import { CoverLetterTab } from './tabs/CoverLetterTab';
import { CriticTab } from './tabs/CriticTab';

export const MobileEditor: React.FC = () => {
    const { activeTab, setActiveTab } = useUIStore();
    const { t } = useTranslation();

    const MOBILE_TABS = [
        { id: 'personal', label: t('editor.sidebar.tabs.personal'), icon: User },
        { id: 'experience', label: t('editor.sidebar.tabs.experience'), icon: Briefcase },
        { id: 'education', label: t('editor.sidebar.tabs.education'), icon: GraduationCap },
        { id: 'letter', label: t('editor.sidebar.tabs.letter'), icon: FileText },
        { id: 'critic', label: t('editor.sidebar.tabs.review'), icon: TrendingUp },
    ] as const;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return <PersonalTab />;
            case 'experience':
                return <ExperienceTab />;
            case 'education':
                return <EducationTab />;
            case 'letter':
                return <CoverLetterTab />;
            case 'critic':
                return <CriticTab />;
            default:
                return <PersonalTab />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Tab Navigation - Horizontal scrollable */}
            <div className="bg-white border-b border-slate-200 px-2 py-2 overflow-x-auto flex-shrink-0">
                <div className="flex gap-2 min-w-max">
                    {MOBILE_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-4"
                    >
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MobileEditor;
