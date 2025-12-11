/**
 * PDF Generation Route - Server-side using @react-pdf/renderer
 * 
 * SYNCED WITH CVDocumentV2.tsx (Client Engine)
 * Last sync: 2025-12-11
 * 
 * IMPORTANT: This file runs in Node.js (tsx), not Vite.
 * Path aliases like @/ do NOT work here. Use relative paths.
 */

import express from 'express';
import React from 'react';
import { renderToBuffer, Document, Page, View, Text, StyleSheet, Font, Svg, Path, Image } from '@react-pdf/renderer';

const router = express.Router();

// ============================================================================
// LAYOUT CONSTANTS - SYNCED WITH theme.config.ts
// ============================================================================

const LAYOUT = {
    page: { width: 595.28, height: 841.89 },  // A4 in points
    sidebar: { width: 180, gap: 40, padding: 20 },
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    mainContentWidth: 595.28 - 180 - 40 - 40 - 40, // page - sidebar - gap - margins
};

// ============================================================================
// GEOMETRIC BULLET COMPONENT - CANONICAL VERSION (matches CVDocumentV2.tsx)
// ============================================================================

type BulletStyle = 'disc' | 'square' | 'dash' | 'arrow' | 'check';

const GeometricBullet: React.FC<{ bulletStyle: BulletStyle; color?: string }> = ({
    bulletStyle,
    color = '#6B7280'
}) => {
    const container = { width: 14, height: 14, justifyContent: 'center' as const, alignItems: 'center' as const };

    switch (bulletStyle) {
        case 'disc':
            return React.createElement(View, { style: container },
                React.createElement(View, { style: { width: 5, height: 5, borderRadius: 3, backgroundColor: color } })
            );
        case 'square':
            return React.createElement(View, { style: container },
                React.createElement(View, { style: { width: 5, height: 5, backgroundColor: color } })
            );
        case 'dash':
            return React.createElement(View, { style: container },
                React.createElement(View, { style: { width: 8, height: 2, backgroundColor: color } })
            );
        case 'arrow':
            return React.createElement(View, { style: container },
                React.createElement(Svg, { viewBox: '0 0 24 24', style: { width: 10, height: 10 } } as any,
                    React.createElement(Path, {
                        d: 'M5 12h14M12 5l7 7-7 7',
                        stroke: color,
                        strokeWidth: 2,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        fill: 'none'
                    } as any)
                )
            );
        case 'check':
            return React.createElement(View, { style: container },
                React.createElement(Svg, { viewBox: '0 0 24 24', style: { width: 10, height: 10 } } as any,
                    React.createElement(Path, {
                        d: 'M20 6L9 17L4 12',
                        stroke: color,
                        strokeWidth: 3,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        fill: 'none'
                    } as any)
                )
            );
        default:
            return React.createElement(View, { style: container },
                React.createElement(View, { style: { width: 5, height: 5, borderRadius: 3, backgroundColor: color } })
            );
    }
};

// ============================================================================
// STYLES FACTORY - Dynamic based on design config
// ============================================================================

const createStyles = (
    accentColor: string,
    sidebarPosition: 'left' | 'right' = 'left',
    sectionLineStyle: 'solid' | 'dashed' | 'dotted' | 'none' = 'solid'
) => {
    const isLeft = sidebarPosition === 'left';

    // Line style resolution (synced with CVDocumentV2.tsx)
    const lineWidth = sectionLineStyle === 'none' ? 0 : 1.5;
    const lineDash = sectionLineStyle === 'dashed' ? 'dashed' :
        sectionLineStyle === 'dotted' ? 'dotted' : 'solid';

    // Sidebar line color - needs to be visible on accent background
    const sidebarLineColor = 'rgba(255,255,255,0.5)';  // White with opacity for contrast

    return StyleSheet.create({
        page: {
            fontFamily: 'Helvetica',
            fontSize: 9,
            backgroundColor: '#FFFFFF',
            position: 'relative',
            // Dynamic padding based on sidebar position
            paddingLeft: isLeft ? LAYOUT.sidebar.width + LAYOUT.sidebar.gap : LAYOUT.margins.left,
            paddingRight: isLeft ? LAYOUT.margins.right : LAYOUT.sidebar.width + LAYOUT.sidebar.gap,
            paddingTop: LAYOUT.margins.top,
            paddingBottom: LAYOUT.margins.bottom,
        },
        // Sidebar background - fixed, repeats on all pages
        sidebarBackground: {
            position: 'absolute',
            top: 0,
            left: isLeft ? 0 : undefined,
            right: isLeft ? undefined : 0,
            width: LAYOUT.sidebar.width,
            height: LAYOUT.page.height,
            backgroundColor: accentColor,
        },
        // Sidebar content container
        sidebarContent: {
            position: 'absolute',
            top: 0,
            left: isLeft ? 0 : undefined,
            right: isLeft ? undefined : 0,
            width: LAYOUT.sidebar.width,
            padding: LAYOUT.sidebar.padding,
            paddingTop: LAYOUT.sidebar.padding + 10,
        },
        photo: {
            width: 80,
            height: 80,
            borderRadius: 40,
            marginBottom: 15,
            alignSelf: 'center',
        },
        sidebarName: {
            fontSize: 14,
            fontFamily: 'Helvetica-Bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 2,
        },
        sidebarTitle: {
            fontSize: 9,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginBottom: 20,
        },
        sidebarSection: {
            marginBottom: 15,
        },
        sidebarSectionTitle: {
            fontSize: 8,
            fontFamily: 'Helvetica-Bold',
            color: 'white',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            paddingBottom: 4,
            borderBottomWidth: lineWidth,  // UNLOCKED: follows theme
            borderBottomColor: sidebarLineColor,  // UNLOCKED: theme-based contrast
            borderBottomStyle: lineDash as any,  // UNLOCKED: solid/dashed/dotted
        },
        sidebarText: {
            fontSize: 8,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 3,
            lineHeight: 1.4,
        },
        skillBadge: {
            backgroundColor: '#FFFFFF',
            paddingVertical: 2,
            paddingHorizontal: 5,
            borderRadius: 2,
            fontSize: 7,
            marginRight: 3,
            marginBottom: 3,
        },
        skillsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        // Main content
        section: {
            marginBottom: 18,
            maxWidth: LAYOUT.mainContentWidth,
        },
        sectionTitle: {
            fontSize: 11,
            fontFamily: 'Helvetica-Bold',
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 10,
            borderBottomWidth: 1.5,
            borderBottomColor: accentColor,
            paddingBottom: 4,
        },
        // Summary with explicit width wrapper
        summaryWrapper: {
            width: LAYOUT.mainContentWidth - 20,
            flexDirection: 'column',  // Allow unlimited text flow, no truncation
        },
        summaryText: {
            fontSize: 9,
            color: '#374151',
            lineHeight: 1.5,
            width: LAYOUT.mainContentWidth - 20,
            maxWidth: LAYOUT.mainContentWidth - 20,
            flexShrink: 1,
        },
        // Experience - STRICT DATE PROTECTION
        expItem: {
            marginBottom: 12,
        },
        expHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
        },
        expRole: {
            fontFamily: 'Helvetica-Bold',
            fontSize: 10,
            color: '#1F2937',
            flex: 1,
            marginRight: 15,
        },
        expDate: {
            fontSize: 8,
            color: '#6B7280',
            flexShrink: 0,
            width: 100,  // WIDENED - fits "Feb 2018 - Present"
            textAlign: 'right' as const,
        },
        expCompany: {
            fontSize: 9,
            color: '#4B5563',
            marginBottom: 4,
        },
        expTask: {
            flexDirection: 'row',
            marginBottom: 2,
            paddingRight: 10,
        },
        expTaskText: {
            flex: 1,
            fontSize: 8,
            color: '#4B5563',
            lineHeight: 1.4,
        },
        // Education - STRICT DATE PROTECTION
        eduItem: {
            marginBottom: 10,
        },
        eduHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
        },
        eduDegree: {
            fontFamily: 'Helvetica-Bold',
            fontSize: 9,
            color: '#1F2937',
            flex: 1,
            marginRight: 15,
        },
        eduYear: {
            fontSize: 8,
            color: '#6B7280',
            flexShrink: 0,
            width: 60,  // WIDENED - fits "2018"
            textAlign: 'right' as const,
        },
        eduSchool: {
            fontSize: 9,
            color: '#4B5563',
        },
    });
};

// ============================================================================
// SERVER-SIDE CV DOCUMENT COMPONENT - SYNCED WITH CVDocumentV2.tsx
// ============================================================================

interface CVProfile {
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
    experiences?: Array<{
        role?: string;
        company?: string;
        dates?: string;
        dateRange?: { displayString?: string };
        tasks?: string[];
    }>;
    educations?: Array<{
        degree?: string;
        school?: string;
        year?: string;
    }>;
    skills?: string[];
    languages?: Array<{ name?: string; level?: string }>;
}

interface DesignConfig {
    accentColor?: string;
    bulletStyle?: BulletStyle;
    sidebarPosition?: 'left' | 'right';
    sectionLineStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
    showPhoto?: boolean;
}

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

const ServerCVDocument: React.FC<{ profile: CVProfile; design?: DesignConfig }> = ({
    profile,
    design = {}
}) => {
    const accentColor = design.accentColor || '#3b82f6';
    const bulletStyle = design.bulletStyle || 'disc';
    const sidebarPosition = design.sidebarPosition || 'left';
    const sectionLineStyle = design.sectionLineStyle || 'solid';
    const showPhoto = design.showPhoto !== false;

    const styles = createStyles(accentColor, sidebarPosition, sectionLineStyle);

    return React.createElement(Document, { title: `CV - ${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}` },
        React.createElement(Page, {
            size: { width: LAYOUT.page.width, height: LAYOUT.page.height },
            style: styles.page,
            wrap: true,
        },
            // 1. GHOST SIDEBAR BACKGROUND - fixed = repeats on ALL pages
            React.createElement(View, { style: styles.sidebarBackground, fixed: true }),

            // 2. SIDEBAR CONTENT - Page 1 only
            React.createElement(View, { style: styles.sidebarContent },
                // Photo
                showPhoto && isValidImageUrl(profile.personal?.photoUrl) &&
                React.createElement(Image, { src: profile.personal!.photoUrl!, style: styles.photo }),

                // Name
                React.createElement(Text, { style: styles.sidebarName }, profile.personal?.firstName || ''),
                React.createElement(Text, { style: styles.sidebarName }, profile.personal?.lastName || ''),

                // Title
                profile.personal?.title &&
                React.createElement(Text, { style: styles.sidebarTitle }, profile.personal.title),

                // Contact
                profile.personal?.contact && React.createElement(View, { style: styles.sidebarSection },
                    React.createElement(Text, { style: styles.sidebarSectionTitle }, 'Contact'),
                    profile.personal.contact.email &&
                    React.createElement(Text, { style: styles.sidebarText }, profile.personal.contact.email),
                    profile.personal.contact.phone &&
                    React.createElement(Text, { style: styles.sidebarText }, profile.personal.contact.phone),
                    profile.personal.contact.address &&
                    React.createElement(Text, { style: styles.sidebarText }, profile.personal.contact.address),
                ),

                // Skills (as badges)
                profile.skills?.length && React.createElement(View, { style: styles.sidebarSection },
                    React.createElement(Text, { style: styles.sidebarSectionTitle }, 'Compétences'),
                    React.createElement(View, { style: styles.skillsRow },
                        ...profile.skills.slice(0, 15).map((skill, i) =>
                            React.createElement(Text, { key: i, style: styles.skillBadge }, skill)
                        ),
                    ),
                ),

                // Languages
                profile.languages?.length && React.createElement(View, { style: styles.sidebarSection },
                    React.createElement(Text, { style: styles.sidebarSectionTitle }, 'Langues'),
                    ...profile.languages.slice(0, 6).map((lang, i) =>
                        React.createElement(Text, { key: i, style: styles.sidebarText },
                            `${lang.name || ''} — ${lang.level || ''}`
                        )
                    ),
                ),
            ),

            // 3. MAIN CONTENT - Normal flow, auto page breaks

            // Summary with wrapper to constrain width
            profile.summary && React.createElement(View, { style: styles.section, wrap: false },
                React.createElement(Text, { style: styles.sectionTitle }, 'Profil'),
                React.createElement(View, { style: styles.summaryWrapper },
                    React.createElement(Text, { style: styles.summaryText }, profile.summary),
                ),
            ),

            // Experience with GeometricBullet
            profile.experiences?.length && React.createElement(View, { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Expérience Professionnelle'),
                ...profile.experiences.map((exp, i) =>
                    React.createElement(View, { key: i, style: styles.expItem, wrap: false },
                        React.createElement(View, { style: styles.expHeader },
                            React.createElement(Text, { style: styles.expRole }, exp.role || ''),
                            React.createElement(Text, { style: styles.expDate },
                                exp.dates || exp.dateRange?.displayString || ''
                            ),
                        ),
                        React.createElement(Text, { style: styles.expCompany }, exp.company || ''),
                        ...(exp.tasks || [])
                            .filter(t => t && t.trim().length > 0)  // Filter empty tasks
                            .slice(0, 6)  // Limit tasks
                            .map((task, j) =>
                                React.createElement(View, { key: j, style: styles.expTask },
                                    React.createElement(GeometricBullet, { bulletStyle }),
                                    React.createElement(Text, { style: styles.expTaskText }, task),
                                )
                            ),
                    )
                ),
            ),

            // Education
            profile.educations?.length && React.createElement(View, { style: styles.section },
                React.createElement(Text, { style: styles.sectionTitle }, 'Formation'),
                ...profile.educations.map((edu, i) =>
                    React.createElement(View, { key: i, style: styles.eduItem, wrap: false },
                        React.createElement(View, { style: styles.eduHeader },
                            React.createElement(Text, { style: styles.eduDegree }, edu.degree || ''),
                            React.createElement(Text, { style: styles.eduYear }, edu.year || ''),
                        ),
                        React.createElement(Text, { style: styles.eduSchool }, edu.school || ''),
                    )
                ),
            ),
        )
    );
};

// ============================================================================
// ROUTES
// ============================================================================

// Health check
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'PDF route is online (SYNCED with CVDocumentV2)',
        engine: 'Server-side @react-pdf/renderer',
        features: ['SVG Bullets', 'Dynamic Sidebar Position', 'Photo Support', 'Layout V2']
    });
});

// Generate PDF
router.post('/generate-pdf', async (req, res) => {
    console.log('[PDF API] ===== PDF GENERATION REQUEST =====');

    try {
        const { profile, design } = req.body;

        if (!profile) {
            return res.status(400).json({ error: 'Profile data is required' });
        }

        console.log(`[PDF API] Generating PDF for: ${profile.personal?.firstName} ${profile.personal?.lastName}`);
        console.log(`[PDF API] Design: bulletStyle=${design?.bulletStyle}, sidebarPosition=${design?.sidebarPosition}`);

        const documentElement = React.createElement(ServerCVDocument, { profile, design });

        const pdfBuffer = await renderToBuffer(documentElement as any);
        console.log('[PDF API] PDF rendered, size:', pdfBuffer.length, 'bytes');

        const lastName = profile.personal?.lastName || 'Resume';
        const firstName = profile.personal?.firstName || '';
        const filename = `cv-${lastName}${firstName ? '-' + firstName : ''}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.send(pdfBuffer);

        console.log(`[PDF API] ✅ PDF sent: ${filename}`);

    } catch (error) {
        console.error('[PDF API] ❌ Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF', message: String(error) });
    }
});

// Download endpoint
router.post('/download', async (req, res) => {
    try {
        const { data, design } = req.body;
        const profile = data || req.body.profile;

        if (!profile) {
            return res.status(400).json({ error: 'Profile data required' });
        }

        console.log(`[PDF API] Download: bulletStyle=${design?.bulletStyle}`);

        const documentElement = React.createElement(ServerCVDocument, { profile, design });
        const pdfBuffer = await renderToBuffer(documentElement as any);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="cv.pdf"');
        res.send(pdfBuffer);

        console.log('[PDF API] ✅ PDF downloaded');

    } catch (error) {
        console.error('[PDF API] ❌ Download error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

export default router;
