/**
 * Structure Page Grid - Grid layout for structure mode
 * Displays CV sections in a grid layout for visual reordering
 */
import React from 'react';
import { SinglePageLayout } from '../../layouts/templates/v2/SinglePageLayout';
import type { CVProfile } from '../../../domain/cv/v2/types';
import type { CVMode } from '../../../application/store/v2/cv-store-v2.types';
import type { TemplateConfig } from '../../../domain/templates/TemplateEngine';

interface StructurePageGridProps {
    pages: { pageIndex: number; sections: string[] }[];
    data: CVProfile;
    mode: CVMode;
    config: TemplateConfig;
    language?: string;
}

export const StructurePageGrid: React.FC<StructurePageGridProps> = ({
    pages,
    data,
    mode,
    config,
    language = 'fr'
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {pages.map((page) => (
                <div key={page.pageIndex} className="transform scale-50 origin-top-left">
                    <SinglePageLayout
                        pageIndex={page.pageIndex}
                        sectionIds={page.sections}
                        data={data}
                        mode={mode}
                        config={config}
                        language={language}
                    />
                </div>
            ))}
        </div>
    );
};
