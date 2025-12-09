import React, { forwardRef } from 'react';
import type { CVProfile } from '@/domain/cv/v2/types';
import { SectionRenderer } from '@/presentation/cv-templates/sections/SectionRenderer';
import { FONT_PAIRINGS } from '@/presentation/cv-templates/templates/types';
import type { DesignConfig } from '@/presentation/cv-templates/templates/types';

interface MeasurementContainerProps {
    profile: CVProfile;
    sectionOrder: string[];
    designConfig: DesignConfig;
    isAts: boolean;
    paperWidth: number; // in pixels
}

export const MeasurementContainer = forwardRef<HTMLDivElement, MeasurementContainerProps>((props, ref) => {
    const { profile, sectionOrder, designConfig, isAts, paperWidth } = props;
    const fonts = FONT_PAIRINGS[designConfig.fontPairing];

    return (
        <div
            ref={ref}
            className="measurement-container"
            style={{
                position: 'fixed',
                left: '-9999px',
                top: 0,
                width: paperWidth, // Important: must match real page width for text mapping
                visibility: 'hidden',
                pointerEvents: 'none',
                // Copy font styles to ensure accurate height measurement
                fontFamily: isAts ? 'Arial, sans-serif' : fonts.body,
                fontSize: `${designConfig.fontSize}rem`,
                lineHeight: designConfig.lineHeight,
                padding: '48px', // PAGE_MARGINS (must match useDOMMeasuredPagination constant)
            }}
        >
            {sectionOrder.map((sectionId) => (
                <div key={sectionId} data-section-id={sectionId}>
                    <SectionRenderer
                        sectionId={sectionId}
                        profile={profile}
                        accentColor={designConfig.accentColor}
                        headingFont={fonts.heading}
                        bodyFont={fonts.body}
                        showSignature={true} // Measure signature if present
                    />
                </div>
            ))}
        </div>
    );
});
