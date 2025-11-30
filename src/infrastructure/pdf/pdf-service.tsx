
import { jsPDF } from 'jspdf';
// import React from 'react'; // Not needed with react-jsx
import { createRoot } from 'react-dom/client';
import type { CVProfile } from '../../domain/entities/cv';
import type { PDFVariant, SectionBlock } from '../../domain/pdf/types';
import { PDF_CONFIG } from '../../domain/pdf/template-config';
import { LayoutEngine } from '../../domain/pdf/layout-engine';
import { PdfPageTemplate } from '../../presentation/pdf/PdfPageTemplate';
import { PageRenderer } from './page-renderer';

export class PDFService {
    static async generate(profile: CVProfile, variant: PDFVariant = 'visual', language: string = 'en'): Promise<void> {
        // 1. Extract Config Explicitly (State Agnostic)
        const { accentColor, fontFamily } = profile.metadata;
        const config = PDF_CONFIG[variant];

        console.log('PDF Generation Config:', { variant, accentColor, fontFamily, config, language });

        // 2. Calculate Layout
        const allSections = this.mapProfileToSections(profile, language);

        // Split into Main Content and Sidebar
        // Sidebar: Skills, Languages (future)
        // Main: Profile, Experience, Education
        const sidebarSections = allSections.filter(s => s.id === 'skills');
        const mainSections = allSections.filter(s => s.id !== 'skills');

        const engine = new LayoutEngine(config, accentColor);
        const pages = engine.paginate(mainSections);

        // 3. Mount React Components to DOM (Hidden)
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-10000px';
        container.style.left = '-10000px';

        // CRITICAL: Force A4 dimensions and reset transforms
        container.style.width = '794px'; // A4 @ 96 DPI
        container.style.minWidth = '794px';
        container.style.height = '1123px'; // A4 @ 96 DPI
        container.style.overflow = 'hidden';
        container.style.transform = 'none';
        container.style.zoom = '1';

        document.body.appendChild(container);

        try {
            const root = createRoot(container);

            await new Promise<void>((resolve) => {
                root.render(
                    <div id="pdf-root" style={{ width: '794px', margin: 0, padding: 0 }}>
                        <style>
                            {`
                                * {
                                    font-family: '${fontFamily}', sans-serif !important;
                                }
                            `}
                        </style>
                        {pages.map(page => (
                            <PdfPageTemplate
                                key={page.id}
                                page={{
                                    ...page,
                                    accentColor: accentColor || config.colors.primary,
                                }}
                                fontFamily={fontFamily}
                                sidebarData={page.index === 0 ? sidebarSections : undefined} // Pass sidebar only to first page for now
                            />
                        ))}
                    </div>
                );
                setTimeout(resolve, 500);
            });

            // Wait for fonts
            await document.fonts.ready;
            await this.waitForResources(container);

            // 4. Render to PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageElements = container.querySelectorAll('.pdf-page');

            for (let i = 0; i < pageElements.length; i++) {
                const pageEl = pageElements[i] as HTMLElement;

                // Add new page if not first
                if (i > 0) pdf.addPage();

                // Render
                const scale = variant === 'visual' ? 3 : 2; // Higher quality for visual
                const dataUrl = await PageRenderer.renderToImage(pageEl, scale);

                // Add to PDF
                const mmWidth = 210;
                const mmHeight = 297;
                pdf.addImage(dataUrl, 'PNG', 0, 0, mmWidth, mmHeight, undefined, 'FAST');
            }

            // 5. Save
            const filename = `CV_${profile.personal.lastName}_${profile.personal.firstName}_${variant}.pdf`;
            const safeFilename = filename.replace(/[^a-z0-9_\-\.]/gi, '_');
            pdf.save(safeFilename);

        } catch (error) {
            console.error('PDF Generation failed', error);
            throw error;
        } finally {
            // Cleanup
            document.body.removeChild(container);
        }
    }

    private static mapProfileToSections(profile: CVProfile, language: string = 'en'): SectionBlock[] {
        const sections: SectionBlock[] = [];

        // Profile / Personal Info
        sections.push({
            id: 'personal',
            type: 'profile',
            title: language === 'fr' ? 'Profil' : 'Profile',
            items: [profile.personal, profile.summary],
            isVisible: true,
            canSplit: 'none',
            estimatedHeight: 250 // Estimate
        });

        // Experience
        if (profile.experiences.length > 0) {
            sections.push({
                id: 'experience',
                type: 'experience',
                title: language === 'fr' ? 'Expérience' : 'Experience',
                items: profile.experiences.map(exp => ({
                    id: exp.id,
                    role: exp.role,
                    company: exp.company,
                    dates: exp.dates,
                    location: exp.location,
                    tasks: exp.tasks || []
                })),
                isVisible: true,
                canSplit: 'byItem',
                // More accurate estimate: 40px header + items
                estimatedHeight: 40 + profile.experiences.reduce((acc, exp) => {
                    // Base item height (role + company + dates) ~ 50px
                    // Tasks: ~20px per task line
                    const tasksHeight = (exp.tasks || []).length * 20;
                    return acc + 50 + tasksHeight + 20; // +20 padding
                }, 0)
            });
        }

        // Education
        if (profile.educations.length > 0) {
            sections.push({
                id: 'education',
                type: 'education',
                title: language === 'fr' ? 'Formation' : 'Education',
                items: profile.educations.map(edu => ({
                    id: edu.id,
                    degree: edu.degree,
                    school: edu.school,
                    year: edu.year,
                    description: edu.description
                })),
                isVisible: true,
                canSplit: 'byItem',
                estimatedHeight: 40 + profile.educations.reduce((acc, _) => {
                    return acc + 60;
                }, 0)
            });
        }

        // Skills
        if (profile.skills.length > 0) {
            sections.push({
                id: 'skills',
                type: 'skills',
                title: language === 'fr' ? 'Compétences' : 'Skills',
                items: profile.skills,
                isVisible: true,
                canSplit: 'byGroup',
                estimatedHeight: 150
            });
        }

        return sections;
    }

    private static async waitForResources(container: HTMLElement) {
        const images = container.getElementsByTagName('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });
        await Promise.all(promises);

        // Font loading check
        if (document.fonts) {
            await document.fonts.ready;
        }

        // Extra safety buffer
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}
