/**
 * CVDocument - GHOST SIDEBAR ARCHITECTURE + MODULAR THEMES
 * 
 * THE ONLY PDF RENDERING ENGINE.
 * Now with full theme support from NEXAL Studio.
 * 
 * Features:
 * - Font pairing (sans/serif/mono)
 * - Font size scaling
 * - Line height control
 * - Header style variations
 * - Accent color
 */

import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import type { CVProfile } from '@/domain/cv/v2/types';
import { CV_LIMITS, truncateText, limitArray } from '@/domain/cv-limits';
import type { DesignConfig, FontPairing } from '@/application/store/v2/cv-store-v2.types';
import { DEFAULT_DESIGN } from '@/application/store/v2/cv-store-v2.types';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

// Disable hyphenation for cleaner text
Font.registerHyphenationCallback((word) => [word]);

// Map font pairings to React-PDF built-in fonts
const FONT_MAP: Record<FontPairing, string> = {
    sans: 'Helvetica',
    serif: 'Times-Roman',
    mono: 'Courier',
};

const FONT_MAP_BOLD: Record<FontPairing, string> = {
    sans: 'Helvetica-Bold',
    serif: 'Times-Bold',
    mono: 'Courier-Bold',
};

// ============================================================================
// PAPER CONFIG
// ============================================================================

interface PaperConfig {
    widthPt: number;
    heightPt: number;
    sidebarWidthPt: number;
    margins: { top: number; right: number; bottom: number };
}

const PAPER_CONFIGS: Record<string, PaperConfig> = {
    A4: {
        widthPt: 595.28,
        heightPt: 841.89,
        sidebarWidthPt: 180,
        margins: { top: 40, right: 40, bottom: 40 },
    },
    LETTER: {
        widthPt: 612,
        heightPt: 792,
        sidebarWidthPt: 184,
        margins: { top: 40, right: 40, bottom: 40 },
    },
};

// ============================================================================
// DEFAULT DESIGN (fallback) - imported from store types
// ============================================================================

// Local fallback for standalone usage (e.g., server-side rendering)
const LOCAL_DEFAULT_DESIGN: DesignConfig = { ...DEFAULT_DESIGN };

// Bullet character mapping
const BULLET_CHARS: Record<string, string> = {
    disc: '•',
    square: '▪',
    dash: '–',
    arrow: '→',
    check: '✓',
};

// ============================================================================
// AUTO-SCALE NAME FONT SIZE
// ============================================================================

/**
 * Calculate optimal font size for name display
 * Ensures names never overflow or wrap to multiple lines
 * 
 * Logic:
 * - Short names (≤12 chars): Large premium font (16pt)
 * - Medium names (13-20 chars): Standard font (14pt)
 * - Long names (21-30 chars): Slightly smaller (12pt)
 * - Very long names (>30 chars): Compact font (10pt)
 */
const getNameFontSize = (name: string, scale: number): number => {
    const len = name?.length || 0;
    if (len > 30) return 10 * scale;  // Very long - compact
    if (len > 20) return 12 * scale;  // Long - medium-small
    if (len > 12) return 14 * scale;  // Medium - standard
    return 16 * scale;                 // Short - premium large
};

/**
 * Calculate optimal font size for job title
 * Titles can be longer, so more gradual scaling
 */
const getTitleFontSize = (title: string, scale: number): number => {
    const len = title?.length || 0;
    if (len > 60) return 7 * scale;   // Very long title
    if (len > 40) return 8 * scale;   // Long title
    if (len > 20) return 9 * scale;   // Medium title
    return 10 * scale;                 // Short title
};

// ============================================================================
// STYLES FACTORY
// ============================================================================

interface ThemeConfig {
    paper: PaperConfig;
    design: DesignConfig;
    fontFamily: string;
    fontFamilyBold: string;
}

const createStyles = (theme: ThemeConfig) => {
    const { paper, design, fontFamily, fontFamilyBold } = theme;
    const scale = design.fontSize;
    const lh = design.lineHeight;
    const accent = design.accentColor;

    // Section line color - use accent or custom
    const lineColor = design.sectionLineColor === 'accent' ? accent : design.sectionLineColor;
    // Section line style - map to borderStyle (React-PDF only supports solid/dashed/dotted)
    const lineStyle = design.sectionLineStyle === 'none' ? 0 : 1.5;
    const lineDash = design.sectionLineStyle === 'dashed' ? 'dashed' :
        design.sectionLineStyle === 'dotted' ? 'dotted' : 'solid';

    // Calculate main content width
    const mainContentWidth = paper.widthPt - paper.sidebarWidthPt - 20 - paper.margins.right;

    return StyleSheet.create({
        page: {
            fontFamily,
            fontSize: 10 * scale,
            backgroundColor: '#FFFFFF',
            position: 'relative',
            paddingLeft: paper.sidebarWidthPt + 20,
            paddingTop: paper.margins.top,
            paddingRight: paper.margins.right,
            paddingBottom: paper.margins.bottom,
        },

        // GHOST SIDEBAR BACKGROUND - fixed = repeats on ALL pages
        sidebarBackground: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: paper.sidebarWidthPt,
            height: paper.heightPt,
            backgroundColor: accent,
        },

        // SIDEBAR CONTENT - Page 1 only
        sidebarContent: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: paper.sidebarWidthPt,
            padding: 20,
            paddingTop: 30,
        },

        // Sidebar elements
        photo: { width: 70, height: 70, borderRadius: 35, marginBottom: 15, alignSelf: 'center' },
        sidebarName: { fontFamily: fontFamilyBold, fontSize: 14 * scale, color: '#FFFFFF', textAlign: 'center', marginBottom: 2 },
        sidebarTitle: { fontSize: 9 * scale, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 20 },
        sidebarSection: { marginBottom: 15 },
        sidebarSectionTitle: { fontFamily: fontFamilyBold, fontSize: 8 * scale, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)' },
        sidebarText: { fontSize: 8 * scale, color: 'rgba(255,255,255,0.9)', marginBottom: 3, lineHeight: lh },
        skillBadge: { backgroundColor: '#FFFFFF', paddingVertical: 2, paddingHorizontal: 5, borderRadius: 2, fontSize: 7 * scale, marginRight: 3, marginBottom: 3 },
        skillsRow: { flexDirection: 'row', flexWrap: 'wrap' },

        // Main content elements
        section: { marginBottom: 18, maxWidth: mainContentWidth },
        sectionTitle: {
            fontFamily: fontFamilyBold,
            fontSize: 11 * scale,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 10,
            paddingBottom: 4,
            borderBottomWidth: lineStyle,
            borderBottomStyle: lineDash as any,
            color: accent,
            borderBottomColor: lineColor
        },
        summaryText: { fontSize: 9 * scale, lineHeight: lh, color: '#374151', maxWidth: mainContentWidth },

        // Experience
        expItem: { marginBottom: 12 },
        expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        expRole: { fontFamily: fontFamilyBold, fontSize: 10 * scale, color: '#1F2937' },
        expDate: { fontSize: 8 * scale, color: '#6B7280' },
        expCompany: { fontSize: 9 * scale, color: '#4B5563', marginBottom: 4 },
        expTask: { flexDirection: 'row', marginBottom: 2 },
        expBullet: { fontSize: 8 * scale, marginRight: 5, width: 8, color: accent },
        expTaskText: { fontSize: 8 * scale, color: '#4B5563', flex: 1, lineHeight: lh },

        // Education
        eduItem: { marginBottom: 10 },
        eduHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
        eduDegree: { fontFamily: fontFamilyBold, fontSize: 10 * scale, color: '#1F2937' },
        eduYear: { fontSize: 8 * scale, color: '#6B7280' },
        eduSchool: { fontSize: 9 * scale, color: '#4B5563' },
    });
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface CVDocumentProps {
    profile: CVProfile;
    format?: 'A4' | 'LETTER';
    design?: Partial<DesignConfig>;
    // Legacy prop for backward compatibility
    accentColor?: string;
}

export const CVDocument: React.FC<CVDocumentProps> = ({
    profile,
    format = 'A4',
    design: designProp,
    accentColor,
}) => {
    // ════════════════════════════════════════════════════════════════════════
    // DESIGN CONFIG - Merged with defaults, country rules pre-fill in store
    // ════════════════════════════════════════════════════════════════════════
    const design: DesignConfig = {
        ...LOCAL_DEFAULT_DESIGN,
        ...designProp,
        // Legacy accentColor prop takes precedence if provided
        accentColor: accentColor || designProp?.accentColor || profile?.metadata?.accentColor || LOCAL_DEFAULT_DESIGN.accentColor,
    };

    // Paper format: use design.paperFormat if set, otherwise fallback to format prop
    const activeFormat = design.paperFormat || format;
    const paper = PAPER_CONFIGS[activeFormat] || PAPER_CONFIGS.A4;

    const fontFamily = FONT_MAP[design.fontPairing];
    const fontFamilyBold = FONT_MAP_BOLD[design.fontPairing];

    const theme: ThemeConfig = { paper, design, fontFamily, fontFamilyBold };
    const styles = createStyles(theme);

    // Get bullet character from design
    const bulletChar = BULLET_CHARS[design.bulletStyle] || '•';

    return (
        <Document title={`CV - ${profile.personal.firstName} ${profile.personal.lastName}`}>
            <Page size={{ width: paper.widthPt, height: paper.heightPt }} style={styles.page} wrap>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* 1. GHOST SIDEBAR BACKGROUND - fixed = repeats on ALL pages  */}
                {/* ════════════════════════════════════════════════════════════ */}
                <View style={styles.sidebarBackground} fixed />

                {/* ════════════════════════════════════════════════════════════ */}
                {/* 2. SIDEBAR CONTENT - Page 1 only                            */}
                {/* ════════════════════════════════════════════════════════════ */}
                <View style={styles.sidebarContent}>
                    {/* PHOTO: Controlled by design.showPhoto (pre-filled by country rules, user can override) */}
                    {design.showPhoto && profile.personal.photoUrl && (
                        <Image src={profile.personal.photoUrl} style={styles.photo} />
                    )}
                    <Text style={[styles.sidebarName, { fontSize: getNameFontSize(profile.personal.firstName, design.fontSize) }]}>
                        {profile.personal.firstName}
                    </Text>
                    <Text style={[styles.sidebarName, { fontSize: getNameFontSize(profile.personal.lastName, design.fontSize) }]}>
                        {profile.personal.lastName}
                    </Text>
                    {profile.personal.title && (
                        <Text style={[styles.sidebarTitle, { fontSize: getTitleFontSize(profile.personal.title, design.fontSize) }]}>
                            {profile.personal.title}
                        </Text>
                    )}

                    {/* Contact */}
                    <View style={styles.sidebarSection}>
                        <Text style={styles.sidebarSectionTitle}>Contact</Text>
                        {profile.personal.contact?.email && <Text style={styles.sidebarText}>✉ {profile.personal.contact.email}</Text>}
                        {profile.personal.contact?.phone && <Text style={styles.sidebarText}>☎ {profile.personal.contact.phone}</Text>}
                        {profile.personal.contact?.address && <Text style={styles.sidebarText}>📍 {profile.personal.contact.address}</Text>}
                    </View>

                    {/* Skills */}
                    {profile.skills?.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarSectionTitle}>Compétences</Text>
                            <View style={styles.skillsRow}>
                                {limitArray(profile.skills, CV_LIMITS.skills.maxSkills).map((s, i) => (
                                    <Text key={i} style={[styles.skillBadge, { color: design.accentColor }]}>
                                        {truncateText(s, CV_LIMITS.skills.skillMaxChars)}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Languages */}
                    {profile.languages?.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarSectionTitle}>Langues</Text>
                            {limitArray(profile.languages, CV_LIMITS.languages.maxLanguages).map((l, i) => (
                                <Text key={i} style={styles.sidebarText}>{l.name} — {l.level}</Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* ════════════════════════════════════════════════════════════ */}
                {/* 3. MAIN CONTENT - Normal flow, auto page breaks             */}
                {/*    NO wrapper View - content flows directly in page         */}
                {/* ════════════════════════════════════════════════════════════ */}

                {/* Summary */}
                {profile.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Profil</Text>
                        <Text style={styles.summaryText}>
                            {truncateText(profile.summary, CV_LIMITS.summary.maxChars)}
                        </Text>
                    </View>
                )}

                {/* Experience */}
                {profile.experiences?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
                        {profile.experiences.map((exp, i) => (
                            <View key={i} style={styles.expItem}>
                                <View style={styles.expHeader}>
                                    <Text style={styles.expRole}>
                                        {truncateText(exp.role, CV_LIMITS.experience.role.maxChars)}
                                    </Text>
                                    <Text style={styles.expDate}>{exp.dates || exp.dateRange?.displayString}</Text>
                                </View>
                                <Text style={styles.expCompany}>
                                    {truncateText(exp.company, CV_LIMITS.experience.company.maxChars)}
                                </Text>
                                {limitArray(exp.tasks, CV_LIMITS.experience.maxTasks).map((t, j) => (
                                    <View key={j} style={styles.expTask}>
                                        <Text style={styles.expBullet}>{bulletChar}</Text>
                                        <Text style={styles.expTaskText}>
                                            {truncateText(t, CV_LIMITS.experience.task.maxChars)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {profile.educations?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Formation</Text>
                        {profile.educations.map((edu, i) => (
                            <View key={i} style={styles.eduItem}>
                                <View style={styles.eduHeader}>
                                    <Text style={styles.eduDegree}>
                                        {truncateText(edu.degree, CV_LIMITS.education.degree.maxChars)}
                                    </Text>
                                    <Text style={styles.eduYear}>{edu.year}</Text>
                                </View>
                                <Text style={styles.eduSchool}>
                                    {truncateText(edu.school, CV_LIMITS.education.school.maxChars)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

            </Page>
        </Document>
    );
};

export default CVDocument;

