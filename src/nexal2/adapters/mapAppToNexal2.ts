/**
 * NEXAL2 - App Profile/Design Adapter
 *
 * Maps the application's CVProfile and DesignConfig to NEXAL2-compatible format.
 * NEXAL2 remains the source of truth (SceneGraph → LayoutTree → Renderers).
 *
 * Data sources:
 * - CVProfile: from useProfile() hook
 * - DesignConfig: from useDesign() hook (separate store state)
 *
 * Sprint 6.2: Fixed education mapping with robust key aliasing.
 */

import type { CVProfile } from '@/domain/cv/v2/types';
import type { DesignConfig } from '@/application/store/v2/cv-store-v2.types';

// ============================================================================
// STRING HELPER
// ============================================================================

/** Safe string coercion: null/undefined → '', otherwise trim */
const s = (v: unknown): string => (v == null ? '' : String(v).trim());

// ============================================================================
// NEXAL2 PROFILE TYPE (what buildScene expects)
// ============================================================================

/**
 * NEXAL2 Profile - Normalized structure for buildScene.
 *
 * IMPORTANT: This must match what buildScene.ts expects:
 * - personal.contact.email/phone/address (nested)
 * - educations (plural, not education)
 * - experiences (plural)
 */
export interface Nexal2Profile {
    id?: string;
    personal?: {
        firstName?: string;
        lastName?: string;
        title?: string;
        photoUrl?: string;
        contact?: {
            email?: string;
            phone?: string;
            address?: string;
        };
    };
    summary?: string;
    skills?: string[];
    languages?: Array<{ name: string; level: string }>;
    experiences?: Array<{
        company?: string;
        role?: string;  // buildScene uses 'role'
        dates?: string;
        dateRange?: { displayString?: string; isCurrent?: boolean };
        tasks?: string[];
    }>;
    educations?: Array<{  // Plural to match buildScene
        degree?: string;
        school?: string;
        year?: string;
    }>;
}

/**
 * NEXAL2 Design Config (what buildScene expects)
 */
export interface Nexal2Design {
    paperFormat: 'A4' | 'LETTER';
    accentColor: string;
    fontPair: string;
    showPhoto: boolean;
    sidebarPosition: 'left' | 'right';
    headerStyle: 'classic' | 'modern' | 'minimal';
}

// ============================================================================
// PROFILE ADAPTER
// ============================================================================

/**
 * Map app CVProfile to NEXAL2 profile format.
 *
 * Sprint 6.2: Robust key aliasing for education fields.
 *
 * @param profile - App CVProfile from store
 * @returns Nexal2Profile with normalized structure
 */
export function mapProfileToNexal2(profile: CVProfile | undefined): Nexal2Profile {
    if (!profile) {
        return {
            id: '',
            personal: {
                firstName: '',
                lastName: '',
                title: '',
                contact: { email: '', phone: '', address: '' },
            },
            summary: '',
            skills: [],
            languages: [],
            experiences: [],
            educations: [],
        };
    }

    // Normalize experiences - ensure dates field is populated
    const normalizedExperiences = (profile.experiences || []).map((exp) => ({
        company: s(exp.company),
        role: s(exp.role) || s((exp as any).title), // Alias: title -> role
        dates: s(exp.dates) ||
            s(exp.dateRange?.displayString) ||
            ((exp as any).startDate
                ? `${s((exp as any).startDate)} - ${s((exp as any).endDate) || 'Present'}`
                : ''),
        dateRange: exp.dateRange,
        tasks: Array.isArray(exp.tasks) ? exp.tasks.map(s) : [],
    }));

    // Sprint 6.2: Normalize educations with robust key aliasing
    // App may use: degree, diploma, title, name
    // App may use: school, institution, establishment, company
    // App may use: year, endYear, graduationYear, dateEnd, dateFin
    const normalizedEducations = (profile.educations || []).map((edu) => {
        const raw = edu as any; // For aliasing
        return {
            degree: s(edu.degree) || s(raw.diploma) || s(raw.title) || s(raw.name),
            school: s(edu.school) || s(raw.institution) || s(raw.establishment) || s(raw.company),
            year: s(edu.year) || s(raw.endYear) || s(raw.graduationYear) || s(raw.dateEnd) || s(raw.dateFin),
        };
    });

    return {
        id: profile.id,
        personal: {
            firstName: s(profile.personal?.firstName),
            lastName: s(profile.personal?.lastName),
            title: s(profile.personal?.title),
            photoUrl: profile.personal?.photoUrl,
            // Preserve nested contact structure (buildScene expects this)
            contact: {
                email: s(profile.personal?.contact?.email),
                phone: s(profile.personal?.contact?.phone),
                address: s(profile.personal?.contact?.address),
            },
        },
        summary: s(profile.summary),
        skills: (profile.skills || []).map(s),
        languages: (profile.languages || []).map((l) => ({
            name: s(l.name),
            level: s(l.level),
        })),
        experiences: normalizedExperiences,
        educations: normalizedEducations,
    };
}

// ============================================================================
// DESIGN ADAPTER
// ============================================================================

/**
 * Map app DesignConfig to NEXAL2 design format.
 * DesignConfig comes from useDesign() hook (store.design state).
 */
export function mapDesignToNexal2(design: Partial<DesignConfig> | undefined): Nexal2Design {
    return {
        paperFormat: design?.paperFormat || 'A4',
        accentColor: design?.accentColor || '#4F46E5',
        fontPair: design?.fontPairing || 'sans',
        showPhoto: design?.showPhoto !== false,
        sidebarPosition: design?.sidebarPosition || 'left',
        headerStyle: (design?.headerStyle as 'classic' | 'modern' | 'minimal') || 'classic',
    };
}

// ============================================================================
// COMBINED ADAPTER
// ============================================================================

/**
 * Combined adapter: maps both profile and design in one call.
 *
 * @param profile - CVProfile from useProfile()
 * @param design - DesignConfig from useDesign()
 */
export function mapAppToNexal2(
    profile: CVProfile | undefined,
    design: Partial<DesignConfig> | undefined
): { profile: Nexal2Profile; design: Nexal2Design } {
    return {
        profile: mapProfileToNexal2(profile),
        design: mapDesignToNexal2(design),
    };
}

export default mapAppToNexal2;
