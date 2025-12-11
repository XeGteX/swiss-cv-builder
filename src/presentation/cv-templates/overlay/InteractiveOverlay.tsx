/**
 * InteractiveOverlay - Ghost Layer for Inline PDF Editing
 * 
 * THEME ENGINE SYNCED:
 * - Uses mapDesignToTheme() and calculateLayout() from Theme Engine
 * - Positions are 100% synchronized with CVDocumentV2
 * - Scales automatically with zoom
 * - Updates instantly when design changes (sidebar position, etc.)
 */

import React, { useMemo } from 'react';
import { GhostField } from './GhostField';
import type { FieldZone } from '../shared/layoutConstants';
import type { CVProfile } from '@/domain/cv/v2/types';
import {
    useDesign,
    useProfilePersonal,
    useProfileSkills,
    useProfileLanguages,
    useProfileExperiences,
    useProfileEducations,
    useProfileSummary
} from '@/application/store/v2';
import {
    mapDesignToTheme,
    calculateLayout,
    estimateTextHeight,
    ptToPx,
} from '@/application/pdf-engine/theme';

// ═══════════════════════════════════════════════════════════════════════════
// CALIBRATION CONSTANTS - Compensate for PDF internal padding
// PDF uses sidebarPadding: 20pt + paddingTop: +10pt = offset needed
// Adjust these if overlay zones are shifted from actual PDF content
// ═══════════════════════════════════════════════════════════════════════════
const GLOBAL_OFFSET_X = 0;   // Horizontal offset (usually 0 if sidebar is absolute)
const GLOBAL_OFFSET_Y = 0;   // Vertical offset (adjust if zones are above/below text)

// Photo URL validation - EXACTLY matches CVDocumentV2
const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    return url.trim().length > 0;
};

interface InteractiveOverlayProps {
    /** Current zoom scale (must match PDF viewer) */
    scale: number;
    /** Enable/disable overlay */
    enabled?: boolean;
    /** Debug mode - show all zones with borders */
    debug?: boolean;
}

/**
 * Generate field zones from computed layout
 * Uses estimateTextHeight for smart vertical sync
 */
function generateFieldZonesFromLayout(
    layout: ReturnType<typeof calculateLayout>,
    profile: CVProfile,
    showPhoto: boolean
): FieldZone[] {
    const zones: FieldZone[] = [];
    const fs = layout.fontSize;
    const lineHeight = 1.4;

    // ═══════════════════════════════════════════════════════════════════════
    // SIDEBAR ZONES - Use pre-calculated positions from DATA-AWARE layout
    // CALIBRATION: Apply global offsets to compensate for PDF internal padding
    // ═══════════════════════════════════════════════════════════════════════

    // Helper to apply calibration offsets
    const calibrate = (x: number, y: number) => ({
        x: x + GLOBAL_OFFSET_X,
        y: y + GLOBAL_OFFSET_Y,
    });

    // Debug log
    console.log('[InteractiveOverlay] Layout zones (DATA-AWARE):', {
        sidebarPhoto: layout.sidebarPhoto,
        sidebarFirstName: layout.sidebarFirstName,
        sidebarLastName: layout.sidebarLastName,
        sidebarTitle: layout.sidebarTitle,
        GLOBAL_OFFSET_X,
        GLOBAL_OFFSET_Y,
    });

    // Photo zone - only if photo exists
    if (showPhoto) {
        const pos = calibrate(layout.sidebarPhoto.x, layout.sidebarPhoto.y);
        zones.push({
            id: 'personal.photoUrl',
            path: 'personal.photoUrl',
            type: 'photo',
            left: pos.x,
            top: pos.y,
            width: layout.sidebarPhoto.width || 85,
            height: layout.sidebarPhoto.height || 85,
            placeholder: 'Photo',
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SPLIT HEADER ZONES - FirstName, LastName, Title (editable separately)
    // CALIBRATION: Apply global offsets via calibrate helper
    // ═══════════════════════════════════════════════════════════════════════

    // FirstName zone
    const fnPos = calibrate(layout.sidebarFirstName.x, layout.sidebarFirstName.y);
    zones.push({
        id: 'personal.firstName',
        path: 'personal.firstName',
        left: fnPos.x,
        top: fnPos.y,
        width: layout.sidebarFirstName.width,
        height: layout.sidebarFirstName.height,
        placeholder: 'Prénom',
    });

    // LastName zone
    const lnPos = calibrate(layout.sidebarLastName.x, layout.sidebarLastName.y);
    zones.push({
        id: 'personal.lastName',
        path: 'personal.lastName',
        left: lnPos.x,
        top: lnPos.y,
        width: layout.sidebarLastName.width,
        height: layout.sidebarLastName.height,
        placeholder: 'Nom',
    });

    // Title zone
    const titlePos = calibrate(layout.sidebarTitle.x, layout.sidebarTitle.y);
    zones.push({
        id: 'personal.title',
        path: 'personal.title',
        left: titlePos.x,
        top: titlePos.y,
        width: layout.sidebarTitle.width,
        height: layout.sidebarTitle.height,
        placeholder: 'Titre',
    });

    // Contact zone
    const contactPos = calibrate(layout.sidebarContact.x, layout.sidebarContact.y);
    zones.push({
        id: 'contact.email',
        path: 'personal.contact.email',
        type: 'email',
        left: contactPos.x,
        top: contactPos.y,
        width: layout.sidebarContact.width,
        height: 20,
        placeholder: 'Email',
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SKILLS ZONE - Single large zone covering entire skills section
    // Easier to click than individual skill badges
    // ═══════════════════════════════════════════════════════════════════════
    const skillsPos = calibrate(layout.sidebarSkills.x, layout.sidebarSkills.y);
    zones.push({
        id: 'skills.all',
        path: 'skills',
        type: 'skills',  // Special type for skills editor
        left: skillsPos.x,
        top: skillsPos.y,
        width: layout.sidebarSkills.width,
        height: layout.sidebarSkills.height || 80,
        placeholder: 'Compétences',
    });

    // ═══════════════════════════════════════════════════════════════════════
    // LANGUAGES ZONE - Single large zone covering entire languages section
    // ═══════════════════════════════════════════════════════════════════════
    const langPos = calibrate(layout.sidebarLanguages.x, layout.sidebarLanguages.y);
    zones.push({
        id: 'languages.all',
        path: 'languages',
        type: 'languages',  // Special type for languages editor
        left: langPos.x,
        top: langPos.y,
        width: layout.sidebarLanguages.width,
        height: layout.sidebarLanguages.height || 60,
        placeholder: 'Langues',
    });

    // =========================================================================
    // MAIN CONTENT - Smart Vertical Sync with cursorY accumulator
    // =========================================================================
    const mainX = layout.mainContent.x;
    const mainWidth = layout.mainContent.width;
    let cursorY = layout.mainContent.y;

    // Summary section title
    cursorY += fs.sectionTitle * lineHeight + 10;

    // Summary zone - dynamic height based on content
    const summaryHeight = estimateTextHeight(
        profile?.summary,
        fs.bodyText,
        mainWidth,
        lineHeight
    );
    zones.push({
        id: 'summary',
        path: 'summary',
        multiline: true,
        left: mainX,
        top: cursorY,
        width: mainWidth,
        height: Math.max(30, summaryHeight),
        placeholder: 'Résumé',
    });
    cursorY += Math.max(30, summaryHeight) + layout.spacing.sectionMargin;

    // Experience section
    if (profile?.experiences?.length) {
        // Section title
        cursorY += fs.sectionTitle * lineHeight + 10;

        profile.experiences.forEach((exp, i) => {
            // Calculate role height dynamically
            const roleWidth = mainWidth - 75 - 15; // minus date width and margin
            const roleHeight = estimateTextHeight(exp.role, fs.bodyText + 1, roleWidth, lineHeight);

            zones.push({
                id: `experiences[${i}].role`,
                path: `experiences[${i}].role`,
                left: mainX,
                top: cursorY,
                width: roleWidth,
                height: Math.max(14, roleHeight),
                placeholder: `Poste ${i + 1}`,
            });
            cursorY += Math.max(14, roleHeight) + 4;

            // Company zone
            const companyHeight = estimateTextHeight(exp.company, fs.bodyText, mainWidth, lineHeight);
            zones.push({
                id: `experiences[${i}].company`,
                path: `experiences[${i}].company`,
                left: mainX,
                top: cursorY,
                width: mainWidth,
                height: Math.max(12, companyHeight),
                placeholder: `Entreprise ${i + 1}`,
            });
            cursorY += Math.max(12, companyHeight) + 4;

            // Tasks
            if (exp.tasks?.length) {
                exp.tasks.forEach((task, j) => {
                    const taskHeight = estimateTextHeight(task, fs.smallText, mainWidth - 12, lineHeight);
                    zones.push({
                        id: `experiences[${i}].tasks[${j}]`,
                        path: `experiences[${i}].tasks[${j}]`,
                        left: mainX + 12,
                        top: cursorY,
                        width: mainWidth - 12,
                        height: Math.max(12, taskHeight),
                        placeholder: `Tâche ${j + 1}`,
                    });
                    cursorY += Math.max(12, taskHeight) + 2;
                });
            }

            cursorY += layout.spacing.itemMargin;
        });
    }

    return zones;
}

/**
 * InteractiveOverlay - Perfectly synced with PDF via Theme Engine
 */
export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({
    scale,
    enabled = true,
    debug = false,
}) => {
    const design = useDesign();

    // ════════════════════════════════════════════════════════════════════════
    // PERFORMANCE OPTIMIZED: Granular hooks instead of useProfile()
    // Only re-renders when SPECIFIC data changes (not on tab switch!)
    // ════════════════════════════════════════════════════════════════════════
    const personal = useProfilePersonal();
    const skills = useProfileSkills();
    const languages = useProfileLanguages();
    const experiences = useProfileExperiences();
    const educations = useProfileEducations();
    const summary = useProfileSummary();

    // Reconstruct profile object for functions that need it
    // Type assertion is safe because all fields come from the same store
    const profile = useMemo(() => ({
        id: 'overlay-profile',
        lastUpdated: Date.now(),
        personal: personal || { firstName: '', lastName: '', title: '', contact: { email: '', phone: '', address: '' } },
        skills: skills || [],
        languages: languages || [],
        experiences: experiences || [],
        educations: educations || [],
        summary: summary || '',
        metadata: { templateId: 'chameleon-v2', accentColor: '#3b82f6', density: 'comfortable' as const, fontFamily: 'sans' as const },
        strengths: [] as string[],
    }), [personal, skills, languages, experiences, educations, summary]);

    // ========================================================================
    // THEME ENGINE INTEGRATION - DATA-AWARE: Pass profile to calculator
    // ========================================================================
    const theme = useMemo(() => mapDesignToTheme(design ?? {}), [design]);

    // DATA-AWARE LAYOUT: Calculator now receives profile to make same decisions as CVDocumentV2
    const layout = useMemo(() => calculateLayout(theme, profile), [theme, profile]);

    // Photo display - uses isValidImageUrl just like CVDocumentV2
    const hasPhoto = useMemo(() => {
        const photoUrl = personal?.photoUrl;
        return isValidImageUrl(photoUrl);
    }, [personal?.photoUrl]);

    // Generate field zones from computed layout (no more photoOffset needed!)
    const zones = useMemo(() => {
        return generateFieldZonesFromLayout(layout, profile, hasPhoto);
    }, [layout, profile, hasPhoto]);

    if (!enabled) return null;

    // ═══════════════════════════════════════════════════════════════════════
    // SIMPLIFIED ALIGNMENT:
    // - Overlay fills 100% of stage container (same as PDF canvas)
    // - Zone coordinates are in points (at scale=1, 1pt = 1px)
    // - CSS transform handles zoom
    // ═══════════════════════════════════════════════════════════════════════

    // Container fills the stage (100% of PDF canvas)
    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        // Fill exactly the same space as PDF canvas
        width: '100%',
        height: '100%',
        // Pointer events only on the ghost fields
        pointerEvents: 'none',
        // Debug styling
        border: debug ? '3px solid red' : 'none',
        background: debug ? 'rgba(255, 0, 0, 0.05)' : 'transparent',
        boxSizing: 'border-box',
        // Ensure it's above PDF but below modals
        zIndex: 20,
        // CRITICAL: No margin, no padding
        margin: 0,
        padding: 0,
    };

    // Enable pointer events on wrapper for fields
    const fieldsWrapperStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
    };

    return (
        <div style={containerStyle} className="interactive-overlay">
            <div style={fieldsWrapperStyle}>
                {zones.map((zone) => (
                    <GhostField
                        key={zone.id}
                        zone={zone}
                        scale={scale}
                        accentColor={theme.styling.accentColor}
                        debug={debug}
                    />
                ))}
            </div>

            {/* Debug Panel - Shows layout info from Theme Engine */}
            {debug && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        background: 'rgba(0,0,0,0.9)',
                        color: 'white',
                        fontSize: 10,
                        padding: '8px 12px',
                        borderRadius: 6,
                        pointerEvents: 'none',
                        fontFamily: 'monospace',
                    }}
                >
                    <div>Scale: {scale.toFixed(2)}</div>
                    <div>Zones: {zones.length}</div>
                    <div>Format: {theme.paper}</div>
                    <div>Sidebar: {theme.geometry.sidebarPosition}</div>
                    <div>Sidebar X: {layout.sidebar.x.toFixed(0)}pt</div>
                    <div>Main X: {layout.mainContent.x.toFixed(0)}pt</div>
                </div>
            )}
        </div>
    );
};

export default InteractiveOverlay;
