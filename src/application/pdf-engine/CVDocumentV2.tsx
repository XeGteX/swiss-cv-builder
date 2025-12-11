/**
 * CVDocumentV2 - GENESIS V2
 * 
 * Clean implementation of the PDF renderer using Theme Engine.
 * NO magic numbers. ALL geometry comes from ThemeConfig.
 * 
 * Architecture:
 * 1. Props → mapDesignToTheme() → ThemeConfig
 * 2. ThemeConfig → calculateLayout() → ComputedLayout
 * 3. ComputedLayout → StyleSheet.create() → Styles
 * 4. Styles → React-PDF Components → PDF
 */

import React, { useMemo } from 'react';
import {
    Document,
    Page,
    View,
    Text,
    Image,
    StyleSheet,
    Font,
    Svg,
    Path,
    Circle,
} from '@react-pdf/renderer';
import type { CVProfile } from '@/domain/cv/v2/types';
import type { DesignConfig } from '@/application/store/v2/cv-store-v2.types';
import { DEFAULT_DESIGN } from '@/application/store/v2/cv-store-v2.types';
import { CV_LIMITS, truncateText, limitArray } from '@/domain/cv-limits';

// Theme Engine
import {
    mapDesignToTheme,
    calculateLayout,
    type ThemeConfig,
    type ComputedLayout,
} from './theme';

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

Font.registerHyphenationCallback((word) => [word]);

const FONT_FAMILY_MAP = {
    sans: { regular: 'Helvetica', bold: 'Helvetica-Bold' },
    serif: { regular: 'Times-Roman', bold: 'Times-Bold' },
    mono: { regular: 'Courier', bold: 'Courier-Bold' },
} as const;

// ============================================================================
// HELPERS
// ============================================================================

const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
};

// ============================================================================
// SPACEX STANDARD: BULLETPROOF ARRAY GUARDS
// These helpers ensure NO .map() ever crashes on corrupted data
// ============================================================================

/** Safely get array - returns empty array if data is corrupted */
const safeArray = <T,>(arr: T[] | undefined | null | string): T[] => {
    if (!arr) return [];
    if (!Array.isArray(arr)) {
        console.warn('[CVDocumentV2] DATA CORRUPTION DETECTED: Expected array, got:', typeof arr);
        return [];
    }
    return arr;
};

/** Safely filter and get array */
const safeFilter = <T,>(arr: T[] | undefined | null, predicate: (item: T) => boolean): T[] => {
    return safeArray(arr).filter(predicate);
};

// ============================================================================
// STYLES FACTORY - Uses ComputedLayout from Theme Engine
// ============================================================================

interface StyleFactoryInput {
    layout: ComputedLayout;
    theme: ThemeConfig;
    fontFamily: string;
    fontFamilyBold: string;
}

const createStyles = ({ layout, theme, fontFamily, fontFamilyBold }: StyleFactoryInput) => {
    const { geometry, styling, spacing } = theme;
    const fs = layout.fontSize;
    const lh = theme.typography.lineHeight;

    // Line style resolution
    const lineWidth = styling.sectionLineStyle === 'none' ? 0 : styling.sectionLineWidth;
    const lineDash = styling.sectionLineStyle === 'dashed' ? 'dashed' :
        styling.sectionLineStyle === 'dotted' ? 'dotted' : 'solid';

    // Sidebar line color - needs to be visible on accent background
    // If line color is 'accent' (same as bg), use white with opacity for contrast
    const sidebarLineColor = layout.lineColor === styling.accentColor
        ? 'rgba(255,255,255,0.5)'
        : layout.lineColor;

    return StyleSheet.create({
        // ═══════════════════════════════════════════════════════════════════
        // PAGE - Dynamic padding based on sidebar position
        // ═══════════════════════════════════════════════════════════════════
        page: {
            fontFamily,
            fontSize: fs.bodyText,
            backgroundColor: '#FFFFFF',
            position: 'relative',
            // Dynamic padding based on sidebar position
            paddingLeft: geometry.sidebarPosition === 'left'
                ? layout.sidebar.width + geometry.sidebarGap
                : geometry.margins.left,
            paddingRight: geometry.sidebarPosition === 'right'
                ? layout.sidebar.width + geometry.sidebarGap
                : geometry.margins.right,
            paddingTop: geometry.margins.top,
            paddingBottom: geometry.margins.bottom,
        },

        // ═══════════════════════════════════════════════════════════════════
        // SIDEBAR BACKGROUND - Fixed, repeats on all pages
        // ═══════════════════════════════════════════════════════════════════
        sidebarBackground: {
            position: 'absolute',
            top: 0,
            // Dynamic left/right based on position
            left: geometry.sidebarPosition === 'left' ? 0 : undefined,
            right: geometry.sidebarPosition === 'right' ? 0 : undefined,
            width: layout.sidebar.width,
            height: layout.page.height,
            backgroundColor: styling.accentColor,
        },

        // ═══════════════════════════════════════════════════════════════════
        // SIDEBAR CONTENT - Page 1 only
        // ═══════════════════════════════════════════════════════════════════
        sidebarContent: {
            position: 'absolute',
            top: 0,
            left: geometry.sidebarPosition === 'left' ? 0 : undefined,
            right: geometry.sidebarPosition === 'right' ? 0 : undefined,
            width: layout.sidebar.width,
            padding: geometry.sidebarPadding,
            paddingTop: geometry.sidebarPadding + 10,
        },

        // Sidebar elements
        photo: {
            width: styling.photoSize,
            height: styling.photoSize,
            borderRadius: styling.photoRadius,
            marginBottom: spacing.photoMarginBottom,
            alignSelf: 'center',
        },
        sidebarName: {
            fontFamily: fontFamilyBold,
            fontSize: fs.sidebarName,
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 2,
        },
        sidebarTitle: {
            fontSize: fs.sidebarTitle,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginBottom: 20,
        },
        sidebarSection: {
            marginBottom: spacing.sidebarSectionMarginBottom,
        },
        sidebarSectionTitle: {
            fontFamily: fontFamilyBold,
            fontSize: fs.sidebarSectionTitle,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 6,
            paddingBottom: 4,
            borderBottomWidth: lineWidth,  // UNLOCKED: follows theme
            borderBottomColor: sidebarLineColor,  // UNLOCKED: theme-based or contrast white
            borderBottomStyle: lineDash as any,  // UNLOCKED: solid/dashed/dotted
        },
        sidebarText: {
            fontSize: fs.sidebarText,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 3,
            lineHeight: lh,
        },
        skillBadge: {
            backgroundColor: '#FFFFFF',
            paddingVertical: 2,
            paddingHorizontal: 5,
            borderRadius: 2,
            fontSize: fs.smallText,
            marginRight: 3,
            marginBottom: 3,
        },
        skillsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },

        // ═══════════════════════════════════════════════════════════════════
        // MAIN CONTENT
        // ═══════════════════════════════════════════════════════════════════
        section: {
            marginBottom: spacing.sectionMarginBottom,
            maxWidth: layout.mainContent.width,
        },
        sectionTitle: {
            fontFamily: fontFamilyBold,
            fontSize: fs.sectionTitle,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: spacing.sectionTitleMarginBottom,
            paddingBottom: 4,
            borderBottomWidth: lineWidth,
            borderBottomStyle: lineDash as any,
            color: styling.accentColor,
            borderBottomColor: layout.lineColor,
        },
        summaryText: {
            fontSize: fs.bodyText,
            lineHeight: lh,
            color: '#374151',
            width: layout.mainContent.width - 20,  // EXPLICIT width for text wrap with safety margin
            maxWidth: layout.mainContent.width - 20,
            flexShrink: 1,  // Allow text to shrink and wrap
        },

        // Experience - STRICT DATE PROTECTION
        expItem: { marginBottom: spacing.expItemMarginBottom },
        expHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',  // Date stays at top if title wraps
            marginBottom: 4,
        },
        expRole: {
            fontFamily: fontFamilyBold,
            fontSize: fs.bodyText + 1,
            color: '#1F2937',
            flex: 1,            // Take all remaining space
            marginRight: 15,    // Safety cushion before date
            // NO maxWidth - let text wrap naturally
        },
        expDate: {
            fontSize: fs.smallText,
            color: '#6B7280',
            flexShrink: 0,      // FORBIDDEN TO SHRINK
            width: 100,         // WIDENED from 75 - fits "Feb 2018 - Present"
            textAlign: 'right' as const,
        },
        expCompany: { fontSize: fs.bodyText, color: '#4B5563', marginBottom: 4 },
        expTask: { flexDirection: 'row', marginBottom: 2, paddingRight: 10 },
        expBullet: { width: 12, fontSize: fs.smallText, color: '#6B7280' },
        expTaskText: { flex: 1, fontSize: fs.smallText, color: '#4B5563', lineHeight: lh },

        // Education - STRICT DATE PROTECTION
        eduItem: { marginBottom: spacing.eduItemMarginBottom },
        eduHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
        },
        eduDegree: {
            fontFamily: fontFamilyBold,
            fontSize: fs.bodyText,
            color: '#1F2937',
            flex: 1,
            marginRight: 15,
        },
        eduYear: {
            fontSize: fs.smallText,
            color: '#6B7280',
            flexShrink: 0,
            width: 60,          // WIDENED from 50 - fits "2018"
            textAlign: 'right' as const,
        },
        eduSchool: { fontSize: fs.bodyText, color: '#4B5563' },
    });
};

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface CVDocumentV2Props {
    profile: CVProfile;
    design?: Partial<DesignConfig>;
    /** @deprecated Use design.paperFormat instead */
    format?: 'A4' | 'LETTER';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CVDocumentV2: React.FC<CVDocumentV2Props> = ({
    profile,
    design: designProp,
    format = 'A4',
}) => {
    // ════════════════════════════════════════════════════════════════════════
    // STEP 1: Merge design with defaults
    // ════════════════════════════════════════════════════════════════════════
    const design: DesignConfig = useMemo(() => ({
        accentColor: designProp?.accentColor ?? DEFAULT_DESIGN.accentColor,
        fontPairing: designProp?.fontPairing ?? DEFAULT_DESIGN.fontPairing,
        fontSize: designProp?.fontSize ?? DEFAULT_DESIGN.fontSize,
        lineHeight: designProp?.lineHeight ?? DEFAULT_DESIGN.lineHeight,
        headerStyle: designProp?.headerStyle ?? DEFAULT_DESIGN.headerStyle,
        sidebarPosition: designProp?.sidebarPosition ?? DEFAULT_DESIGN.sidebarPosition,
        sectionLineStyle: designProp?.sectionLineStyle ?? DEFAULT_DESIGN.sectionLineStyle,
        sectionLineColor: designProp?.sectionLineColor ?? DEFAULT_DESIGN.sectionLineColor,
        bulletStyle: designProp?.bulletStyle ?? DEFAULT_DESIGN.bulletStyle,
        showPhoto: designProp?.showPhoto ?? DEFAULT_DESIGN.showPhoto,
        targetCountry: designProp?.targetCountry ?? DEFAULT_DESIGN.targetCountry,
        paperFormat: designProp?.paperFormat ?? format,
    }), [designProp, format]);

    // ════════════════════════════════════════════════════════════════════════
    // STEP 2: Convert to ThemeConfig via mapper
    // ════════════════════════════════════════════════════════════════════════
    const theme = useMemo(() => mapDesignToTheme(design), [design]);

    // ════════════════════════════════════════════════════════════════════════
    // STEP 3: Calculate layout from theme
    // ════════════════════════════════════════════════════════════════════════
    const layout = useMemo(() => calculateLayout(theme), [theme]);

    // ════════════════════════════════════════════════════════════════════════
    // STEP 4: Get fonts and create styles
    // ════════════════════════════════════════════════════════════════════════
    const fonts = FONT_FAMILY_MAP[theme.typography.fontFamily];
    const styles = useMemo(() => createStyles({
        layout,
        theme,
        fontFamily: fonts.regular,
        fontFamilyBold: fonts.bold,
    }), [layout, theme, fonts]);

    // Geometric Bullet Component - CANONICAL VERSION from NEXUS STATE REPORT
    const GeometricBullet: React.FC<{ color?: string }> = ({ color = '#6B7280' }) => {
        const container = { width: 14, height: 14, justifyContent: 'center' as const, alignItems: 'center' as const };

        switch (design.bulletStyle) {
            case 'disc':
                return (
                    <View style={container}>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
                    </View>
                );
            case 'square':
                return (
                    <View style={container}>
                        <View style={{ width: 5, height: 5, backgroundColor: color }} />
                    </View>
                );
            case 'dash':
                return (
                    <View style={container}>
                        <View style={{ width: 8, height: 2, backgroundColor: color }} />
                    </View>
                );
            case 'arrow':
                return (
                    <View style={container}>
                        <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
                            <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </Svg>
                    </View>
                );
            case 'check':
                return (
                    <View style={container}>
                        <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
                            <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </Svg>
                    </View>
                );
            default:
                return (
                    <View style={container}>
                        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
                    </View>
                );
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════════════════════════════════════
    return (
        <Document title={`CV - ${profile.personal.firstName} ${profile.personal.lastName}`}>
            <Page
                size={{ width: layout.page.width, height: layout.page.height }}
                style={styles.page}
                wrap
            >
                {/* ════════════════════════════════════════════════════════════ */}
                {/* 1. GHOST SIDEBAR BACKGROUND - fixed = repeats on ALL pages  */}
                {/* ════════════════════════════════════════════════════════════ */}
                <View style={styles.sidebarBackground} fixed />

                {/* ════════════════════════════════════════════════════════════ */}
                {/* 2. SIDEBAR CONTENT - Page 1 only                            */}
                {/* ════════════════════════════════════════════════════════════ */}
                <View style={styles.sidebarContent}>
                    {/* Photo - FORCE DISPLAY if photoUrl exists (user data priority) */}
                    {isValidImageUrl(profile.personal.photoUrl) && (
                        <Image src={profile.personal.photoUrl} style={styles.photo} />
                    )}

                    {/* Name */}
                    <Text style={styles.sidebarName}>{profile.personal.firstName}</Text>
                    <Text style={styles.sidebarName}>{profile.personal.lastName}</Text>

                    {/* Title */}
                    {profile.personal.title && (
                        <Text style={styles.sidebarTitle}>{profile.personal.title}</Text>
                    )}

                    {/* Contact */}
                    <View style={styles.sidebarSection}>
                        <Text style={styles.sidebarSectionTitle}>Contact</Text>
                        {profile.personal.contact?.email && (
                            <Text style={styles.sidebarText}>{profile.personal.contact.email}</Text>
                        )}
                        {profile.personal.contact?.phone && (
                            <Text style={styles.sidebarText}>{profile.personal.contact.phone}</Text>
                        )}
                        {profile.personal.contact?.address && (
                            <Text style={styles.sidebarText}>{profile.personal.contact.address}</Text>
                        )}
                    </View>

                    {/* Skills - CRASH GUARD: Ensure skills is array */}
                    {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                        <View style={styles.sidebarSection}>
                            <Text style={styles.sidebarSectionTitle}>Compétences</Text>
                            <View style={styles.skillsRow}>
                                {limitArray(profile.skills, CV_LIMITS.skills.maxSkills).map((skill, i) => (
                                    <Text key={i} style={styles.skillBadge}>{skill}</Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Languages - CRASH GUARD: Ensure languages is array */}
                    {Array.isArray(profile.languages) && profile.languages.length > 0 && (
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
                {/* ════════════════════════════════════════════════════════════ */}

                {/* Summary */}
                {profile.summary && (
                    <View style={styles.section} wrap={false}>
                        <Text style={styles.sectionTitle}>Profil</Text>
                        {/* View wrapper with explicit width to force word wrap (no overflow hidden!) */}
                        <View style={{ width: layout.mainContent.width - 20, flexDirection: 'column' }}>
                            <Text style={styles.summaryText}>
                                {profile.summary}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Experience - SPACEX STANDARD: Bulletproof with safeFilter */}
                {safeFilter(profile.experiences, exp => !!(exp.role?.trim() || exp.company?.trim())).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Expérience Professionnelle</Text>
                        {safeFilter(profile.experiences, exp => !!(exp.role?.trim() || exp.company?.trim()))
                            .map((exp, i) => (
                                <View key={i} style={styles.expItem} wrap={false}>
                                    <View style={styles.expHeader}>
                                        {exp.role?.trim() && (
                                            <Text style={styles.expRole}>
                                                {exp.role}
                                            </Text>
                                        )}
                                        {(exp.dates?.trim() || exp.dateRange?.displayString) && (
                                            <Text style={styles.expDate}>{exp.dates || exp.dateRange?.displayString}</Text>
                                        )}
                                    </View>
                                    {exp.company?.trim() && (
                                        <Text style={styles.expCompany}>
                                            {exp.company}
                                        </Text>
                                    )}
                                    {safeArray(exp.tasks)
                                        .filter(t => t && t.trim().length > 0)
                                        .slice(0, CV_LIMITS.experience.maxTasks)
                                        .map((t, j) => (
                                            <View key={j} style={styles.expTask}>
                                                <GeometricBullet />
                                                <Text style={styles.expTaskText}>
                                                    {t}
                                                </Text>
                                            </View>
                                        ))}
                                </View>
                            ))}
                    </View>
                )}


                {/* Education - SPACEX STANDARD: Bulletproof with safeFilter */}
                {safeFilter(profile.educations, edu => !!(edu.degree?.trim() || edu.school?.trim())).length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Formation</Text>
                        {safeFilter(profile.educations, edu => !!(edu.degree?.trim() || edu.school?.trim()))
                            .map((edu, i) => (
                                <View key={i} style={styles.eduItem} wrap={false}>
                                    <View style={styles.eduHeader}>
                                        {edu.degree?.trim() && (
                                            <Text style={styles.eduDegree}>
                                                {edu.degree}
                                            </Text>
                                        )}
                                        {edu.year?.trim() && (
                                            <Text style={styles.eduYear}>{edu.year}</Text>
                                        )}
                                    </View>
                                    {edu.school?.trim() && (
                                        <Text style={styles.eduSchool}>
                                            {edu.school}
                                        </Text>
                                    )}
                                </View>
                            ))}
                    </View>
                )}


            </Page>
        </Document>
    );
};

export default CVDocumentV2;
