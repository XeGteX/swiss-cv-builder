import React from 'react';
import type { CVProfile } from '@/domain/cv/v2/types';
import type { PageContent } from '@/presentation/hooks/usePaginationV2';
import { FONT_PAIRINGS } from '@/presentation/cv-templates/templates/types';
import type { DesignConfig } from '@/presentation/cv-templates/templates/types';
import { SectionRenderer } from '@/presentation/cv-templates/sections/SectionRenderer';
import { LanguagesSection } from '@/presentation/cv-templates/sections/LanguagesSection';
import { SkillsSection } from '@/presentation/cv-templates/sections/SkillsSection';

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

export const SidebarLeftPage: React.FC<ChameleonPageProps> = ({
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
    const sidebarWidth = '30%';
    const mainWidth = '70%';

    const sectionProps = {
        accentColor: designConfig.accentColor,
        headingFont: fonts.heading,
        bodyFont: fonts.body
    };

    const sidebarSectionProps = {
        ...sectionProps,
        textColor: 'white'
    };

    // Sidebar sections (Skills, Languages) - always visible on sidebar
    const sidebarSections = ['skills', 'languages'];

    // Main sections (everything else)
    const mainSections = pageContent.sections.filter(
        (s) => !sidebarSections.includes(s.sectionId) &&
            s.sectionId !== 'personal' &&
            s.sectionId !== 'photo'
    );

    return (
        <div
            className="chameleon-page bg-white shadow-lg flex"
            style={{
                width: '100%',
                minHeight: '100%',
                fontFamily: isAts ? 'Arial, sans-serif' : fonts.body,
                fontSize: `${designConfig.fontSize}rem`,
                lineHeight: designConfig.lineHeight
            }}
        >
            {/* Sidebar - Full height, dark accent background */}
            <div
                className="flex-shrink-0 flex flex-col"
                style={{
                    width: sidebarWidth,
                    backgroundColor: designConfig.accentColor,
                    minHeight: '100%'
                }}
            >
                {/* Photo (first page only) */}
                {isFirstPage && showPhoto && profile.personal.photoUrl && (
                    <div className="p-4 flex justify-center">
                        <img
                            src={profile.personal.photoUrl}
                            alt={`${profile.personal.firstName} ${profile.personal.lastName}`}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                        />
                    </div>
                )}

                {/* Name on first page */}
                {isFirstPage && (
                    <div className="px-4 pb-4 text-center text-white">
                        <h1 className="text-xl font-bold">{profile.personal.firstName}</h1>
                        <h1 className="text-xl font-bold">{profile.personal.lastName}</h1>
                        {profile.personal.title && (
                            <p className="text-sm opacity-80 mt-1">{profile.personal.title}</p>
                        )}
                    </div>
                )}

                {/* Page indicator for subsequent pages */}
                {!isFirstPage && (
                    <div className="px-4 py-2 text-white text-sm opacity-70">
                        Page {pageNumber}/{totalPages}
                    </div>
                )}

                {/* Skills */}
                <div className="px-4 pb-4">
                    <SkillsSection
                        skills={profile.skills}
                        {...sidebarSectionProps}
                        compact
                    />
                </div>

                {/* Languages */}
                <div className="px-4 pb-4">
                    <LanguagesSection
                        languages={profile.languages}
                        {...sidebarSectionProps}
                        compact
                    />
                </div>

                {/* Contact (first page only) */}
                {isFirstPage && profile.personal.contact && (
                    <div className="px-4 pb-4 mt-auto">
                        <h2
                            className="text-sm font-semibold border-b border-white/30 pb-1 mb-2 text-white"
                            style={{ fontFamily: fonts.heading }}
                        >
                            Contact
                        </h2>
                        <div className="text-xs text-white/80 space-y-1">
                            {profile.personal.contact.email && (
                                <p>✉ {profile.personal.contact.email}</p>
                            )}
                            {profile.personal.contact.phone && (
                                <p>☎ {profile.personal.contact.phone}</p>
                            )}
                            {profile.personal.contact.linkedin && (
                                <p>🔗 {profile.personal.contact.linkedin}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1" style={{ width: mainWidth }}>
                {/* Mini header for subsequent pages */}
                {!isFirstPage && (
                    <div
                        className="px-4 py-2 border-b text-gray-800 font-medium"
                        style={{ borderColor: designConfig.accentColor }}
                    >
                        {profile.personal.firstName} {profile.personal.lastName}
                    </div>
                )}

                <div className="p-4 space-y-4">
                    {mainSections.map((sectionInfo) => (
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
        </div>
    );
};
