/**
 * MeasurableSections - Renders all sections with data-section-id for measurement
 * 
 * This component is used by CVPaginationWrapper to render sections
 * that can be measured via getBoundingClientRect().
 */

import React from 'react';
import type { CVProfile } from '../../../domain/cv/v2/types';

interface SectionProps {
    accentColor: string;
    headingFont: string;
    bodyFont: string;
}

interface MeasurableSectionsProps {
    profile: CVProfile;
    sectionOrder: string[];
    sectionProps: SectionProps;
    renderSection: (sectionId: string, sectionProps: SectionProps) => React.ReactNode;
}

/**
 * Renders all sections from sectionOrder, each wrapped with data-section-id
 * for DOM measurement purposes.
 */
export const MeasurableSections: React.FC<MeasurableSectionsProps> = ({
    sectionOrder,
    sectionProps,
    renderSection
}) => {
    return (
        <>
            {sectionOrder.map((sectionId) => (
                <div key={sectionId} data-section-id={sectionId}>
                    {renderSection(sectionId, sectionProps)}
                </div>
            ))}
        </>
    );
};

export default MeasurableSections;
