import React from 'react';
import { SinglePageLayout } from '../../layouts/templates/v2/SinglePageLayout';
import type { CVProfile } from '../../../domain/cv/v2/types';
import type { TemplateConfig } from '../../../domain/templates/TemplateEngine';
import type { CVMode } from '../../../application/store/v2/cv-store-v2.types';

interface StructurePageGridProps {
    pages: any[];
    data: CVProfile;
    mode: CVMode;
    config: TemplateConfig;
    language: 'en' | 'fr';
}

import { useSettingsStore } from '../../../application/store/settings-store';

// ... inside component ...

export const StructurePageGrid: React.FC<StructurePageGridProps> = ({
    pages,
    data,
    mode,
    config,
    language
}) => {
    const { focusMode } = useSettingsStore();
    const isSidebarOpen = !focusMode;

    return (
        <div className="w-full min-h-screen bg-transparent p-8 overflow-x-hidden transition-all duration-500">
            <div className="max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Structure du CV</h2>
                    <p className="text-slate-500">
                        {isSidebarOpen
                            ? "Fermez le menu pour organiser vos pages"
                            : "Réorganisez vos sections et déplacez-les entre les pages"}
                    </p>
                </div>

                {/* Smart Grid - Apple Style */}
                <div
                    className={`
                        transition-all duration-500 ease-in-out
                        ${isSidebarOpen
                            ? 'flex flex-col items-center -space-y-64 scale-90' // Card Stack Mode
                            : 'grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center' // Grid Mode
                        }
                    `}
                >
                    {pages.map((page, index) => {
                        // Logic for centering the last item if it's odd and alone in the last row
                        const isLastItem = index === pages.length - 1;
                        const isOddCount = pages.length % 2 !== 0;
                        const shouldSpan = isLastItem && isOddCount && !isSidebarOpen;

                        return (
                            <div
                                key={`page-${page.pageIndex}`}
                                className={`
                                    relative group perspective-1000 transition-all duration-500
                                    ${shouldSpan ? 'md:col-span-2' : ''}
                                `}
                            >
                                {/* Page Container with Apple-like hover effect */}
                                <div className={`
                                    relative 
                                    transition-all duration-500 ease-out
                                    transform 
                                    ${isSidebarOpen ? 'shadow-xl' : 'hover:scale-[0.57] scale-[0.55] hover:rotate-x-2 hover:shadow-2xl'}
                                    bg-white rounded-xl shadow-xl
                                    origin-top
                                `}>
                                    {/* Page Label */}
                                    <div className="absolute -top-12 left-0 w-full text-center">
                                        <span className="bg-slate-800 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                            Page {page.pageIndex + 1}
                                        </span>
                                    </div>

                                    {/* The Page Itself */}
                                    <div className="pointer-events-auto">
                                        <SinglePageLayout
                                            pageIndex={page.pageIndex}
                                            sectionIds={page.sections}
                                            data={data}
                                            mode={mode}
                                            config={config}
                                            language={language}
                                        />
                                    </div>

                                    {/* Interactive Overlay for Page Actions (optional) */}
                                    <div className="absolute inset-0 border-4 border-transparent hover:border-indigo-400/30 rounded-lg pointer-events-none transition-colors duration-300" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
