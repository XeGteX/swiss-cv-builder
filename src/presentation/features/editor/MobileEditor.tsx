import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Briefcase, GraduationCap,
    Wrench, ChevronRight, ArrowLeft
} from 'lucide-react';
import { PersonalTab } from './tabs/PersonalTab';
import { ExperienceTab } from './tabs/ExperienceTab';
import { EducationTab } from './tabs/EducationTab';
import { SkillsTab } from './tabs/SkillsTab';
import { useTranslation } from '../../hooks/useTranslation';
export const MobileEditor: React.FC = () => {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const { t } = useTranslation();

    const SECTIONS = [
        { id: 'personal', label: t('personal.title'), icon: User, component: PersonalTab, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'experience', label: t('sections.experience'), icon: Briefcase, component: ExperienceTab, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'education', label: t('sections.education'), icon: GraduationCap, component: EducationTab, color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'skills', label: t('sections.skills'), icon: Wrench, component: SkillsTab, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.component;

    return (
        <div className="h-full w-full bg-slate-50 relative overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
                {/* HOME VIEW: List of Sections */}
                {!activeSection ? (
                    <motion.div
                        key="home"
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full overflow-y-auto p-4 space-y-3 pb-24 custom-scrollbar"
                    >
                        <div className="mb-4" />

                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-transform"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${section.bg} ${section.color}`}>
                                        <section.icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-semibold text-slate-700">{section.label}</span>
                                        <span className="text-xs text-slate-400">Tap to edit</span>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-slate-300" />
                            </button>
                        ))}
                    </motion.div>
                ) : (
                    /* DETAIL VIEW: Form */
                    <motion.div
                        key="detail"
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full flex flex-col bg-white"
                    >
                        {/* Header */}
                        <div className="h-14 border-b border-slate-100 flex items-center px-4 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <button
                                onClick={() => setActiveSection(null)}
                                className="p-2 -ml-2 mr-2 hover:bg-slate-50 rounded-full transition-colors"
                            >
                                <ArrowLeft size={20} className="text-slate-600" />
                            </button>
                            <span className="font-semibold text-slate-800">
                                {SECTIONS.find(s => s.id === activeSection)?.label}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar">
                            {ActiveComponent && <ActiveComponent />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
