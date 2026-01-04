/**
 * Zone Mapping - PR4 Preview Spotlight
 * 
 * Maps design controls to CV zones for spotlight highlighting.
 */

import type { SpotlightZoneId } from '../context/SpotlightContext';

// ============================================================================
// ZONE DEFINITIONS
// ============================================================================

export interface ZoneInfo {
    id: SpotlightZoneId;
    /** CSS selector to find elements in this zone */
    selector: string;
    /** Fallback to full-page highlight if selector not found */
    fallbackToPage: boolean;
    /** Color for the spotlight effect (defaults to accent) */
    highlightColor?: string;
}

export const ZONE_DEFINITIONS: Record<NonNullable<SpotlightZoneId>, ZoneInfo> = {
    'header-photo': {
        id: 'header-photo',
        selector: '[data-spotlight-zone="header-photo"], [id*="photo"], [id*="Photo"]',
        fallbackToPage: false,
        highlightColor: 'rgba(59, 130, 246, 0.4)', // Blue
    },
    'page-content': {
        id: 'page-content',
        selector: '[data-spotlight-zone="page-content"]',
        fallbackToPage: true,
        highlightColor: 'rgba(99, 102, 241, 0.3)', // Indigo
    },
    'accent-elements': {
        id: 'accent-elements',
        selector: '[data-spotlight-zone="accent-elements"], [id*="title"], [class*="section-title"]',
        fallbackToPage: false,
        highlightColor: 'rgba(236, 72, 153, 0.4)', // Pink
    },
    'typography': {
        id: 'typography',
        selector: '[data-spotlight-zone="typography"]',
        fallbackToPage: true,
        highlightColor: 'rgba(139, 92, 246, 0.3)', // Purple
    },
    'experience-tasks': {
        id: 'experience-tasks',
        selector: '[data-spotlight-zone="experience-tasks"], [id*="experience"], [id*="task"]',
        fallbackToPage: false,
    },
    'sidebar': {
        id: 'sidebar',
        selector: '[data-spotlight-zone="sidebar"], [id="sidebar"]',
        fallbackToPage: false,
        highlightColor: 'rgba(14, 165, 233, 0.4)', // Sky
    },
    'full-document': {
        id: 'full-document',
        selector: '[data-spotlight-zone="full-document"]',
        fallbackToPage: true,
        highlightColor: 'rgba(99, 102, 241, 0.2)', // Indigo light
    },
};

// ============================================================================
// CONTROL-TO-ZONE MAPPING
// ============================================================================

/**
 * Maps control changes to their target zones and labels.
 */
export const CONTROL_ZONE_MAP = {
    photoScale: { zone: 'header-photo' as SpotlightZoneId, label: 'Photo ajustée' },
    density: { zone: 'page-content' as SpotlightZoneId, label: 'Densité modifiée' },
    accentColor: { zone: 'accent-elements' as SpotlightZoneId, label: 'Couleur appliquée' },
    fontPairing: { zone: 'typography' as SpotlightZoneId, label: 'Police changée' },
    fontSize: { zone: 'typography' as SpotlightZoneId, label: 'Taille ajustée' },
    lineHeight: { zone: 'typography' as SpotlightZoneId, label: 'Interligne modifié' },
    bulletStyle: { zone: 'experience-tasks' as SpotlightZoneId, label: 'Puces modifiées' },
    sidebarPosition: { zone: 'sidebar' as SpotlightZoneId, label: 'Sidebar déplacée' },
    layoutPreset: { zone: 'full-document' as SpotlightZoneId, label: 'Mise en page changée' },
    sectionTitleStyle: { zone: 'accent-elements' as SpotlightZoneId, label: 'Style de titre modifié' },
} as const;

export type ControlName = keyof typeof CONTROL_ZONE_MAP;

/**
 * Get zone info for a control name.
 */
export function getZoneForControl(control: ControlName) {
    return CONTROL_ZONE_MAP[control];
}
