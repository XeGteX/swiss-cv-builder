/**
 * ChameleonTemplateV2 - THE DEFINITIVE CV ENGINE
 * 
 * REFACTORED: Validated Modular Architecture
 * 
 * This file is now a lightweight orchestrator that:
 * 1. Manages state (Profile, Region, Design)
 * 2. Calculates Pagination (via useDOMMeasuredPagination)
 * 3. Selects Layout (via SidebarLeftPage / FullWidthPage)
 * 
 * It delegates all rendering to specialized components.
 */

import React, { useMemo, useRef } from 'react';
import { useProfile, useSectionOrder, useMode, useDesign } from '@/application/store/v2';
import { useRegion, useAtsOptimized, useShouldShowPhoto } from '@/presentation/hooks/useRegion';
import { useDOMMeasuredPagination } from '@/presentation/hooks/useDOMMeasuredPagination';
import { useRegionAutoDetect } from '@/presentation/hooks/useRegionAutoDetect';
import { MeasurementContainer } from '@/presentation/components/pagination/MeasurementContainer';
import { FullWidthPage } from '../layouts/FullWidthPage';
import { SidebarLeftPage } from '../layouts/SidebarLeftPage';
import type { CVProfile } from '@/domain/cv/v2/types';
import type { RegionId } from '@/domain/region/types';
import { DEFAULT_DESIGN } from './types';
import type {
    DesignConfig,
    LayoutType,
    HeaderStyle,
    FontPairing
} from './types';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ChameleonTemplateV2Props {
    profile?: CVProfile;
    layoutType?: LayoutType;
    designConfig?: Partial<DesignConfig>;
    className?: string;
    language?: 'fr' | 'en';
    forceMode?: 'modele' | 'edition' | 'structure';
    forceRegion?: RegionId;
}

export const ChameleonTemplateV2: React.FC<ChameleonTemplateV2Props> = ({
    profile: profileProp,
    layoutType = 'full-width',
    designConfig: designConfigProp,
    className = '',
    forceMode,
    forceRegion
}) => {
    // 1. DATA ACCESS
    const storeProfile = useProfile();
    const profile = profileProp || storeProfile;
    const storeDesign = useDesign();
    const storeMode = useMode();
    const mode = forceMode || storeMode;
    const regionProfile = useRegion();
    const sectionOrder = useSectionOrder();
    const isAts = useAtsOptimized();
    const shouldShowPhoto = useShouldShowPhoto();

    // Auto-detect region (runs once on mount)
    const { isUS } = useRegionAutoDetect();

    // 2. DESIGN RESOLUTION
    const isPDFMode = mode === 'modele';
    const designConfig: DesignConfig = useMemo(() => ({
        headerStyle: designConfigProp?.headerStyle || storeDesign?.headerStyle || DEFAULT_DESIGN.headerStyle,
        fontPairing: designConfigProp?.fontPairing || storeDesign?.fontPairing || DEFAULT_DESIGN.fontPairing,
        accentColor: designConfigProp?.accentColor ||
            (isPDFMode
                ? (profile?.metadata?.accentColor || storeDesign?.accentColor || DEFAULT_DESIGN.accentColor)
                : (storeDesign?.accentColor || profile?.metadata?.accentColor || DEFAULT_DESIGN.accentColor)),
        fontSize: storeDesign?.fontSize || DEFAULT_DESIGN.fontSize,
        lineHeight: storeDesign?.lineHeight || DEFAULT_DESIGN.lineHeight
    }), [designConfigProp, storeDesign, profile?.metadata?.accentColor, isPDFMode]);

    // 3. REGION LOGIC
    const effectiveRegion = forceRegion || regionProfile.id;
    // Prioritize auto-detected region preference if not manually overridden (simplified for now)
    // If we detected US, default to Letter, otherwise A4.
    const paperSize = (regionProfile.format?.paperSize || (isUS ? 'letter' : 'a4')) as 'a4' | 'letter';

    // 4. PAGINATION ENGINE
    const measureContainerRef = useRef<HTMLDivElement>(null);
    const pages = useDOMMeasuredPagination(profile, sectionOrder, {
        paperSize,
        containerRef: measureContainerRef
    });

    // 5. RENDER
    if (!profile) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

    const PageComponent = layoutType === 'sidebar-left' ? SidebarLeftPage : FullWidthPage;
    const paperDimensions = paperSize === 'letter' ? { width: 816, height: 1056 } : { width: 794, height: 1123 };

    return (
        <div className={`chameleon-v2-container ${className}`}>
            {/* 
                MEASUREMENT CONTAINER
                Invisible DOM used by useDOMMeasuredPagination to calculate breaks.
                Must strictly match the layout context (width, fonts). 
             */}
            <MeasurementContainer
                ref={measureContainerRef}
                profile={profile}
                sectionOrder={sectionOrder}
                designConfig={designConfig}
                isAts={isAts}
                paperWidth={paperDimensions.width}
            />

            {/* VISIBLE PAGES */}
            <div className="pages-container flex flex-col gap-8 items-center p-8 bg-gray-50/50">
                {pages.map((page, index) => (
                    <div
                        key={index}
                        className="cv-page relative bg-white shadow-2xl transition-transform duration-300"
                        style={{
                            width: `${paperDimensions.width}px`,
                            height: `${paperDimensions.height}px`,
                            // Enforce print break for PDF
                            breakAfter: 'page'
                        }}
                    >
                        <PageComponent
                            pageContent={page}
                            profile={profile}
                            designConfig={designConfig}
                            isAts={isAts}
                            showPhoto={shouldShowPhoto}
                            showSignature={regionProfile.display?.showSignatureBlock ?? false}
                            isFirstPage={index === 0}
                            pageNumber={index + 1}
                            totalPages={pages.length}
                        />
                    </div>
                ))}
            </div>

            {/* PDF PRINT STYLES */}
            <style>
                {`
                    @media print {
                        body { background: white; -webkit-print-color-adjust: exact; }
                        .chameleon-v2-container { padding: 0 !important; }
                        .pages-container { gap: 0 !important; padding: 0 !important; background: white !important; }
                        .cv-page { 
                            box-shadow: none !important; 
                            margin: 0 !important; 
                            width: 100% !important;
                            height: 100% !important;
                            page-break-after: always;
                        }
                    }
                `}
            </style>
        </div>
    );
};
