/**
 * ChameleonTemplateV2 - THE DEFINITIVE CV ENGINE
 * 
 * The ultimate template that automatically adapts to ANY region's cultural norms
 * with intelligent multi-page support, smart sidebar layouts, and full customization.
 * 
 * Features:
 * - MULTI-PAGE: Uses usePaginationV2 for atomic item-level splitting
 * - LAYOUT TYPES: sidebar-left (Silicon) | full-width (Harvard)
 * - DESIGN CONFIG: headerStyle, fontPairing, accentColor
 * - REGION LOGIC: Auto-adapts format/photo/sections based on region
 * - AUTO-DETECTION: Detects country via phone number prefix
 * 
 * This is the BASE for all future templates (Harvard, Silicon, Executive).
 */

import React, { useEffect, useMemo } from 'react';
import { useProfile, useSectionOrder, useMode } from '../../../application/store/v2';
import { useRegion, usePaperDimensions, useAtsOptimized, useShouldShowPhoto } from '../../hooks/useRegion';
import usePaginationV2, { type PageContent } from '../../hooks/usePaginationV2';
import { CVCardStack } from '../../components/CVCardStack';
import {
    SmartHeader,
    SmartSignature
} from '../smart';
import { EditableField } from '../../components/atomic-editor';
import { EditableDateRange, EditableYear } from '../../components/inline-editors';
import type { CVProfile } from '../../../domain/cv/v2/types';
import type { RegionId } from '../../../domain/region/types';

// ============================================================================
// METADATA
// ============================================================================

export const ChameleonV2Meta = {
    id: 'chameleon-v2',
    name: 'Chameleon Multi-Page',
    description: 'Template adaptatif avec support multi-page intelligent.',
    category: 'chameleon' as const,
    tags: ['adaptatif', 'multi-page', 'international', 'ATS', 'photo-optionnelle'],
    thumbnail: '/templates/chameleon.png',
    isNew: true
};

// ============================================================================
// TYPES
// ============================================================================

/** Header visual style */
export type HeaderStyle = 'modern' | 'classic' | 'minimal';

/** Font pairing for the CV */
export type FontPairing = 'sans' | 'serif' | 'mono';

/** Layout type for the CV */
export type LayoutType = 'sidebar-left' | 'full-width';

/** Design configuration for customization */
export interface DesignConfig {
    headerStyle: HeaderStyle;
    fontPairing: FontPairing;
    accentColor: string;
}

/** Main component props */
interface ChameleonTemplateV2Props {
    profile?: CVProfile;
    layoutType?: LayoutType;
    designConfig?: Partial<DesignConfig>;
    className?: string;
    language?: 'fr' | 'en';
    forceMode?: 'modele' | 'edition' | 'structure';
    forceRegion?: RegionId;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Font family mappings for each pairing */
const FONT_PAIRINGS: Record<FontPairing, { heading: string; body: string }> = {
    sans: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif'
    },
    serif: {
        heading: 'Playfair Display, Georgia, serif',
        body: 'Source Serif Pro, Georgia, serif'
    },
    mono: {
        heading: 'JetBrains Mono, Consolas, monospace',
        body: 'IBM Plex Mono, Consolas, monospace'
    }
};

/** Default design configuration */
const DEFAULT_DESIGN: DesignConfig = {
    headerStyle: 'modern',
    fontPairing: 'sans',
    accentColor: '#3b82f6'
};

/** Phone prefix to region mapping for auto-detection */
const PHONE_PREFIX_TO_REGION: Record<string, RegionId> = {
    '+1': 'usa',
    '+33': 'france',
    '+49': 'dach',
    '+41': 'dach',
    '+43': 'dach',
    '+44': 'uk',
    '+81': 'japan',
    '+31': 'benelux',
    '+32': 'benelux',
    '+46': 'nordics',
    '+47': 'nordics',
    '+45': 'nordics',
    '+358': 'nordics',
    '+34': 'spain',
    '+39': 'italy',
    '+971': 'middle-east',
    '+966': 'middle-east',
    '+91': 'india'
};

// ============================================================================
// SECTION RENDERERS
// ============================================================================

interface SectionProps {
    accentColor: string;
    headingFont: string;
    bodyFont: string;
    textColor?: string;
}

const SummarySection: React.FC<SectionProps> = ({ accentColor, headingFont }) => (
    <section id="section-summary" className="cv-section summary mb-4">
        <h2
            className="text-lg font-semibold border-b-2 pb-1 mb-3"
            style={{ borderColor: accentColor, color: accentColor, fontFamily: headingFont }}
        >
            Profil
        </h2>
        <EditableField path="summary" label="Résumé" multiline className="text-gray-700 leading-relaxed">
            {(value) => <p>{value || 'Cliquez pour ajouter un résumé...'}</p>}
        </EditableField>
    </section>
);

interface ExperienceSectionProps extends SectionProps {
    experiences: CVProfile['experiences'];
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
    experiences,
    accentColor,
    headingFont
}) => {
    if (!experiences?.length) return null;

    return (
        <section id="section-experience" className="cv-section experience mb-4">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor, fontFamily: headingFont }}
            >
                Expérience Professionnelle
            </h2>
            <div className="space-y-4">
                {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="experience-item break-inside-avoid">
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField path={`experiences.${idx}.role`} label="Poste" className="font-medium text-gray-900">
                                    {(value) => <h3>{value}</h3>}
                                </EditableField>
                                <EditableField path={`experiences.${idx}.company`} label="Entreprise" className="text-gray-600">
                                    {(value) => <p>{value}</p>}
                                </EditableField>
                            </div>
                            <EditableDateRange experienceIndex={idx} className="text-gray-500" />
                        </div>
                        {exp.tasks && exp.tasks.length > 0 && (
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                {exp.tasks.map((_task, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2" style={{ color: accentColor }}>•</span>
                                        <EditableField path={`experiences.${idx}.tasks.${i}`} label={`Tâche ${i + 1}`}>
                                            {(value) => <span>{value}</span>}
                                        </EditableField>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

interface EducationSectionProps extends SectionProps {
    educations: CVProfile['educations'];
}

const EducationSection: React.FC<EducationSectionProps> = ({
    educations,
    accentColor,
    headingFont
}) => {
    if (!educations?.length) return null;

    return (
        <section id="section-education" className="cv-section education mb-4">
            <h2
                className="text-lg font-semibold border-b-2 pb-1 mb-3"
                style={{ borderColor: accentColor, color: accentColor, fontFamily: headingFont }}
            >
                Formation
            </h2>
            <div className="space-y-3">
                {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="education-item break-inside-avoid">
                        <div className="flex justify-between items-start">
                            <div>
                                <EditableField path={`educations.${idx}.degree`} label="Diplôme" className="font-medium text-gray-900">
                                    {(value) => <h3>{value}</h3>}
                                </EditableField>
                                <EditableField path={`educations.${idx}.school`} label="École" className="text-gray-600">
                                    {(value) => <p>{value}</p>}
                                </EditableField>
                            </div>
                            <EditableYear educationIndex={idx} className="text-sm text-gray-500" />
                        </div>
                        <EditableField path={`educations.${idx}.description`} label="Description" multiline className="mt-1 text-sm text-gray-600">
                            {(value) => value ? <p>{value}</p> : null}
                        </EditableField>
                    </div>
                ))}
            </div>
        </section>
    );
};

interface SkillsSectionProps extends SectionProps {
    skills: CVProfile['skills'];
    compact?: boolean;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, accentColor, headingFont, compact, textColor }) => {
    if (!skills?.length) return null;

    return (
        <section id="section-skills" className="cv-section skills mb-4">
            <h2
                className={`font-semibold border-b-2 pb-1 mb-3 ${compact ? 'text-sm' : 'text-lg'}`}
                style={{ borderColor: accentColor, color: textColor || accentColor, fontFamily: headingFont }}
            >
                Compétences
            </h2>
            <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1' : ''}`}>
                {skills.map((_skill, idx) => (
                    <EditableField key={`skill-${idx}`} path={`skills.${idx}`} label={`Compétence ${idx + 1}`}>
                        {(value) => (
                            <span
                                className={`px-3 py-1 text-white rounded-full ${compact ? 'text-xs px-2' : 'text-sm'}`}
                                style={{ backgroundColor: accentColor }}
                            >
                                {value}
                            </span>
                        )}
                    </EditableField>
                ))}
            </div>
        </section>
    );
};

interface LanguagesSectionProps extends SectionProps {
    languages: CVProfile['languages'];
    compact?: boolean;
}

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
    languages,
    accentColor,
    headingFont,
    compact,
    textColor
}) => {
    if (!languages?.length) return null;

    return (
        <section id="section-languages" className="cv-section languages mb-4">
            <h2
                className={`font-semibold border-b-2 pb-1 mb-3 ${compact ? 'text-sm' : 'text-lg'}`}
                style={{ borderColor: accentColor, color: textColor || accentColor, fontFamily: headingFont }}
            >
                Langues
            </h2>
            <div className={`flex flex-wrap gap-3 ${compact ? 'flex-col gap-1' : ''}`}>
                {languages.map((_lang, idx) => (
                    <div key={idx} className={`flex items-center gap-2 ${compact ? 'gap-1' : ''}`}>
                        <EditableField path={`languages.${idx}.name`} label="Langue" className="font-medium text-gray-800">
                            {(value) => <span style={{ color: textColor }}>{value}</span>}
                        </EditableField>
                        <EditableField path={`languages.${idx}.level`} label="Niveau" className="text-sm text-gray-500">
                            {(value) => <span style={{ color: textColor ? `${textColor}99` : undefined }}>({value})</span>}
                        </EditableField>
                    </div>
                ))}
            </div>
        </section>
    );
};

// ============================================================================
// PAGE LAYOUTS
// ============================================================================

interface ChameleonPageProps {
    pageContent: PageContent;
    profile: CVProfile;
    designConfig: DesignConfig;
    layoutType: LayoutType;
    dimensions: { width: number; height: number };
    isAts: boolean;
    showPhoto: boolean;
    showSignature: boolean;
    isFirstPage: boolean;
    pageNumber: number;
    totalPages: number;
}

/** Full-width layout (Harvard style) */
const FullWidthPage: React.FC<ChameleonPageProps> = ({
    pageContent,
    profile,
    designConfig,
    dimensions,
    isAts,
    showPhoto,
    showSignature,
    isFirstPage,
    pageNumber,
    totalPages
}) => {
    const fonts = FONT_PAIRINGS[designConfig.fontPairing];
    const sectionProps: SectionProps = {
        accentColor: designConfig.accentColor,
        headingFont: fonts.heading,
        bodyFont: fonts.body
    };

    const renderSection = (sectionInfo: PageContent['sections'][0]): React.ReactNode => {
        const sectionId = sectionInfo.sectionId;
        switch (sectionId) {
            case 'summary':
                return <SummarySection key="summary" {...sectionProps} />;
            case 'experience':
                return <ExperienceSection key="experience" experiences={profile.experiences} {...sectionProps} />;
            case 'education':
                return <EducationSection key="education" educations={profile.educations} {...sectionProps} />;
            case 'skills':
                return <SkillsSection key="skills" skills={profile.skills} {...sectionProps} />;
            case 'languages':
                return <LanguagesSection key="languages" languages={profile.languages} {...sectionProps} />;
            case 'signature':
                return showSignature ? (
                    <SmartSignature
                        key="signature"
                        name={`${profile.personal.firstName} ${profile.personal.lastName}`}
                        city={profile.personal.contact?.address}
                    />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div
            className="chameleon-page bg-white shadow-lg"
            style={{
                width: `${dimensions.width}px`,
                minHeight: `${dimensions.height}px`,
                fontFamily: isAts ? 'Arial, sans-serif' : fonts.body
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
                    .map((sectionInfo) => renderSection(sectionInfo))}
            </div>
        </div>
    );
};

/** Sidebar-left layout (Silicon style) */
const SidebarLeftPage: React.FC<ChameleonPageProps> = ({
    pageContent,
    profile,
    designConfig,
    dimensions,
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

    const sectionProps: SectionProps = {
        accentColor: designConfig.accentColor,
        headingFont: fonts.heading,
        bodyFont: fonts.body
    };

    const sidebarSectionProps: SectionProps = {
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

    const renderMainSection = (sectionInfo: PageContent['sections'][0]): React.ReactNode => {
        const sectionId = sectionInfo.sectionId;
        switch (sectionId) {
            case 'summary':
                return <SummarySection key="summary" {...sectionProps} />;
            case 'experience':
                return <ExperienceSection key="experience" experiences={profile.experiences} {...sectionProps} />;
            case 'education':
                return <EducationSection key="education" educations={profile.educations} {...sectionProps} />;
            case 'signature':
                return showSignature ? (
                    <SmartSignature
                        key="signature"
                        name={`${profile.personal.firstName} ${profile.personal.lastName}`}
                        city={profile.personal.contact?.address}
                    />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div
            className="chameleon-page bg-white shadow-lg flex"
            style={{
                width: `${dimensions.width}px`,
                minHeight: `${dimensions.height}px`,
                fontFamily: isAts ? 'Arial, sans-serif' : fonts.body
                // NOTE: No overflow:hidden here for PDF rendering
            }}
        >
            {/* Sidebar - Full height, dark accent background */}
            <div
                className="flex-shrink-0 flex flex-col"
                style={{
                    width: sidebarWidth,
                    backgroundColor: designConfig.accentColor,
                    minHeight: `${dimensions.height}px`
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
                    {mainSections.map((sectionInfo) => renderMainSection(sectionInfo))}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN TEMPLATE V2
// ============================================================================

export const ChameleonTemplateV2: React.FC<ChameleonTemplateV2Props> = ({
    profile: profileProp,
    layoutType = 'full-width',
    designConfig: designConfigProp,
    className = '',
    forceMode,
    forceRegion
}) => {
    // Profile from prop or store
    const storeProfile = useProfile();
    const profile = profileProp || storeProfile;


    // Mode
    const storeMode = useMode();
    const mode = forceMode || storeMode;

    // Region-aware hooks
    const regionProfile = useRegion();
    const sectionOrder = useSectionOrder();
    const _dimensions = usePaperDimensions();
    const isAts = useAtsOptimized();
    const shouldShowPhoto = useShouldShowPhoto();

    // Override region if forced
    const effectiveRegion = forceRegion || regionProfile.id;

    // Design config with defaults
    const designConfig: DesignConfig = useMemo(() => ({
        ...DEFAULT_DESIGN,
        ...designConfigProp,
        accentColor: designConfigProp?.accentColor || profile?.metadata?.accentColor || DEFAULT_DESIGN.accentColor
    }), [designConfigProp, profile?.metadata?.accentColor]);

    // Determine paper dimensions based on region
    const paperSize = regionProfile.format?.paperSize || 'a4';
    const effectiveDimensions = useMemo(() => ({
        width: paperSize === 'letter' ? 816 : 794,  // 8.5in or 210mm at 96dpi
        height: paperSize === 'letter' ? 1056 : 1123 // 11in or 297mm at 96dpi
    }), [paperSize]);

    // ========================================================================
    // AUTO-DETECTION: Detect country from phone number prefix
    // ========================================================================
    useEffect(() => {
        const phone = profile?.personal?.contact?.phone;
        if (!phone || forceRegion) return;

        // Find matching prefix
        for (const [prefix, detectedRegion] of Object.entries(PHONE_PREFIX_TO_REGION)) {
            if (phone.startsWith(prefix)) {
                // Only update if different from current
                if (effectiveRegion !== detectedRegion) {
                    console.log(`[Chameleon] Auto-detected region: ${detectedRegion} from phone: ${phone}`);
                    // Store in localStorage for persistence
                    localStorage.setItem('nexal_region_preference', detectedRegion);
                }
                break;
            }
        }
    }, [profile?.personal?.contact?.phone, forceRegion, effectiveRegion]);

    // ========================================================================
    // PAGINATION: Use V2 for atomic item-level splitting
    // ========================================================================
    const pages = usePaginationV2(
        profile,
        sectionOrder,
        {
            maxPages: regionProfile.maxPages,
            paperSize: regionProfile.format?.paperSize,
            hasSidebar: layoutType === 'sidebar-left'
        }
    );

    // Guard against missing profile
    if (!profile) {
        return (
            <div className="p-8 text-center text-gray-500">
                Chargement du profil...
            </div>
        );
    }

    // Should show signature (region-specific)
    const shouldShowSignature = regionProfile.display?.showSignatureBlock || false;

    // Choose layout component
    const PageComponent = layoutType === 'sidebar-left' ? SidebarLeftPage : FullWidthPage;

    // ========================================================================
    // PDF MODE: All pages stacked with page breaks
    // ========================================================================
    if (mode === 'modele') {
        return (
            <>
                {/* CSS for PDF page breaks */}
                <style>
                    {`
                        @page {
                            size: ${paperSize === 'letter' ? '8.5in 11in' : 'A4'};
                            margin: 0;
                        }
                        @media print {
                            .pdf-page-break {
                                page-break-after: always !important;
                                break-after: page !important;
                            }
                            .pdf-page {
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                            }
                        }
                    `}
                </style>
                <div
                    className={`chameleon-template-v2 ${className}`}
                    data-region={effectiveRegion}
                    data-layout={layoutType}
                >
                    {pages.map((page, idx) => (
                        <div
                            key={`page-${page.pageIndex}`}
                            className="pdf-page"
                            style={{
                                width: paperSize === 'letter' ? '8.5in' : '210mm',
                                height: paperSize === 'letter' ? '11in' : '297mm',
                                minHeight: paperSize === 'letter' ? '11in' : '297mm',
                                // CRITICAL: NO overflow:hidden or maxHeight - allows proper pagination
                                pageBreakAfter: idx < pages.length - 1 ? 'always' : 'auto',
                                breakAfter: idx < pages.length - 1 ? 'page' : 'auto',
                                pageBreakInside: 'avoid',
                                breakInside: 'avoid',
                                boxSizing: 'border-box',
                                position: 'relative'
                            }}
                        >
                            <PageComponent
                                pageContent={page}
                                profile={profile}
                                designConfig={designConfig}
                                layoutType={layoutType}
                                dimensions={effectiveDimensions}
                                isAts={isAts}
                                showPhoto={shouldShowPhoto}
                                showSignature={shouldShowSignature && idx === pages.length - 1}
                                isFirstPage={page.pageIndex === 0}
                                pageNumber={page.pageIndex + 1}
                                totalPages={pages.length}
                            />
                        </div>
                    ))}
                </div>
            </>
        );
    }

    // ========================================================================
    // EDITION MODE: Premium Card Stack display
    // ========================================================================
    return (
        <div
            className={`chameleon-template-v2 ${className}`}
            data-region={effectiveRegion}
            data-layout={layoutType}
        >
            <CVCardStack
                pages={pages.map((page, idx) => (
                    <PageComponent
                        key={`page-${page.pageIndex}`}
                        pageContent={page}
                        profile={profile}
                        designConfig={designConfig}
                        layoutType={layoutType}
                        dimensions={effectiveDimensions}
                        isAts={isAts}
                        showPhoto={shouldShowPhoto}
                        showSignature={shouldShowSignature && idx === pages.length - 1}
                        isFirstPage={page.pageIndex === 0}
                        pageNumber={page.pageIndex + 1}
                        totalPages={pages.length}
                    />
                ))}
            />
        </div>
    );
};

export default ChameleonTemplateV2;
