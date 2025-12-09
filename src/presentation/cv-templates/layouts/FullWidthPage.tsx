import React from 'react';
import type { CVProfile } from '@/domain/cv/v2/types';
import type { PageContent } from '@/presentation/hooks/usePaginationV2';
import { FONT_PAIRINGS } from '@/presentation/cv-templates/templates/types';
import type { DesignConfig } from '@/presentation/cv-templates/templates/types';
import { SmartHeader } from '@/presentation/cv-templates/smart';
import { SectionRenderer } from '@/presentation/cv-templates/sections/SectionRenderer';

interface ChameleonPageProps {
    pageContent: PageContent;
    profile: CVProfile;
    designConfig: DesignConfig;
    isAts: boolean;
    showPhoto: boolean;
    showSignature: boolean;
    isFirstPage: boolean;
    pageNumber: number;
    totalPages: number;
}

export const FullWidthPage: React.FC<ChameleonPageProps> = ({
    pageContent,
    profile,
    designConfig,
    isAts,
    showPhoto,
    showSignature,
    isFirstPage,
    pageNumber,
    totalPages
}) => {
    const fonts = FONT_PAIRINGS[designConfig.fontPairing];

    return (
        <div
            className="chameleon-page bg-white shadow-lg"
            style={{
                width: '100%',
                minHeight: '100%',
                fontFamily: isAts ? 'Arial, sans-serif' : fonts.body,
                fontSize: `${designConfig.fontSize}rem`,
                lineHeight: designConfig.lineHeight
                // NOTE: No overflow:hidden here for PDF rendering
            }}
        >
            {/* Header */}
            {isFirstPage ? (
                <SmartHeader
                    personal={{
                        ...profile.personal,
                        photoUrl: showPhoto ? profile.personal.photoUrl : undefined
                    }}
                    accentColor={designConfig.accentColor}
                    headerStyle={designConfig.headerStyle}
                    showPhoto={showPhoto}
                />
            ) : (
                <div
                    className="px-6 py-3 border-b flex justify-between items-center"
                    style={{ borderColor: designConfig.accentColor }}
                >
                    <div className="font-bold text-gray-800">
                        {profile.personal.firstName} {profile.personal.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                        Page {pageNumber}/{totalPages}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="cv-content p-6 space-y-4">
                {pageContent.sections
                    .filter((s) => s.sectionId !== 'personal' && s.sectionId !== 'photo')
                    .map((sectionInfo) => (
                        <div key={sectionInfo.sectionId} data-section-id={sectionInfo.sectionId}>
                            <SectionRenderer
                                sectionId={sectionInfo.sectionId}
                                profile={profile}
                                accentColor={designConfig.accentColor}
                                headingFont={fonts.heading}
                                bodyFont={fonts.body}
                                showSignature={showSignature}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
};
