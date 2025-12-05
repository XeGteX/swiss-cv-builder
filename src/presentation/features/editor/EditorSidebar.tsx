import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../../application/store/ui-store';
import { cn } from '../../design-system/atoms/Button';
import { User, Briefcase, GraduationCap, Wrench, FileText, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

export const EditorSidebar: React.FC = React.memo(() => {
    const { activeTab, setActiveTab } = useUIStore();
    const { isMobileMode } = useSettingsStore();
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const collapseTimeout = useRef<NodeJS.Timeout | null>(null);

    const ALL_TABS = [
        { id: 'personal', label: t('tabs.personal'), icon: User },
        { id: 'experience', label: t('tabs.experience'), icon: Briefcase },
        { id: 'education', label: t('tabs.education'), icon: GraduationCap },
        { id: 'skills', label: t('tabs.skills'), icon: Wrench },
        { id: 'letter', label: t('tabs.letter'), icon: FileText },
        { id: 'critic', label: t('tabs.review'), icon: TrendingUp },
    ] as const;

    // Get visible tabs: show 2 by default, expand to all 6 on hover
    const getVisibleTabs = () => {
        if (isExpanded) return ALL_TABS;

        const defaultTabs = ALL_TABS.slice(0, 2);
        const activeTabIndex = ALL_TABS.findIndex(tab => tab.id === activeTab);

        if (activeTabIndex < 2) {
            return defaultTabs;
        }

        return [defaultTabs[0], ALL_TABS[activeTabIndex]];
    };

    const visibleTabs = getVisibleTabs();
    const hasHiddenTabs = !isExpanded && ALL_TABS.length > 2;

    // Smooth expand/collapse with delay on exit
    const handleMouseEnter = () => {
        if (collapseTimeout.current) {
            clearTimeout(collapseTimeout.current);
            collapseTimeout.current = null;
        }
        setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        // Delay collapse for smoother UX
        collapseTimeout.current = setTimeout(() => {
            setIsExpanded(false);
        }, 300);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (collapseTimeout.current) {
                clearTimeout(collapseTimeout.current);
            }
        };
    }, []);

    return (
        <div className={cn("flex flex-col h-full w-full lg:min-w-[450px] lg:max-w-[550px] shrink-0 text-slate-100 rounded-xl border border-white/10 overflow-hidden", GlassStyles.panel)}>
            {/* Tabs Header - Collapsible with smooth transitions */}
            <div
                className="border-b border-white/10 sticky top-0 z-10 p-2 bg-slate-900/80 backdrop-blur-md"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <motion.div
                    className={cn(
                        "grid gap-1.5",
                        isExpanded ? "grid-cols-3" : "grid-cols-2",
                        isMobileMode ? "grid-cols-2" : ""
                    )}
                    layout
                    transition={{
                        layout: {
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                            mass: 0.8
                        }
                    }}
                >
                    <AnimatePresence mode="popLayout">
                        {(isExpanded ? ALL_TABS : visibleTabs).map((tab, index) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0,
                                        transition: {
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                            delay: isExpanded ? index * 0.03 : 0
                                        }
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.9,
                                        y: -5,
                                        transition: {
                                            duration: 0.15,
                                            ease: "easeOut"
                                        }
                                    }}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg text-[11px] font-medium transition-colors duration-200',
                                        isActive
                                            ? 'text-white bg-white/10 shadow-lg border border-white/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <Icon size={isMobileMode ? 20 : 18} />
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Expand indicator - smooth transition */}
                <AnimatePresence>
                    {hasHiddenTabs && (
                        <motion.div
                            className="flex justify-center mt-1.5"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                {isExpanded ? (
                                    <ChevronUp size={12} className="animate-pulse" />
                                ) : (
                                    <>
                                        <ChevronDown size={12} />
                                        <span>+{ALL_TABS.length - 2} menus</span>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-transparent">
                {activeTab === 'personal' && <PersonalTab />}
                {activeTab === 'experience' && <ExperienceTab />}
                {activeTab === 'education' && <EducationTab />}
                {activeTab === 'skills' && <SkillsTab />}
                {activeTab === 'letter' && <CoverLetterTab />}
                {activeTab === 'critic' && <CriticTab />}
                {activeTab === 'system' && <SystemInsightsTab />}
            </div>
        </div>
    );
});
