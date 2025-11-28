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
    static async generate(profile: CVProfile, variant: PDFVariant = 'visual'): Promise<void> {
        // 1. Prepare Data
        const sections = this.mapProfileToSections(profile);
        const config = PDF_CONFIG[variant];

        // 2. Calculate Layout
        const engine = new LayoutEngine(config, profile.metadata.accentColor);
        const pages = engine.paginate(sections);

        // 3. Mount React Components to DOM (Hidden)
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-10000px';
        container.style.left = '-10000px';
        // Ensure container doesn't constrain children
        container.style.width = 'auto';
        container.style.height = 'auto';
        document.body.appendChild(container);

        try {
            // We render ALL pages at once to capture them
            const root = createRoot(container);

            // Wrap in a div to hold all pages
            await new Promise<void>((resolve) => {
                root.render(
                    <div id="pdf-root">
                        {pages.map(page => (
                            <PdfPageTemplate key={page.id} page={page} />
                        ))}
                    </div>
                );
                // Give React time to mount
                setTimeout(resolve, 500);
            });

            // Wait for images/fonts
            await this.waitForResources(container);

            // 4. Render each page to Image
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

    private static mapProfileToSections(profile: CVProfile): SectionBlock[] {
        const sections: SectionBlock[] = [];

        // Profile / Personal Info
        sections.push({
            id: 'personal',
            type: 'profile',
            title: 'Profile',
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
                title: 'Experience',
                items: profile.experiences,
                isVisible: true,
                canSplit: 'byItem',
                // More accurate estimate: 40px header + items
                estimatedHeight: 40 + profile.experiences.reduce((acc, exp) => {
                    // Base item height (role + company + dates) ~ 50px
                    // Tasks: ~20px per task line
                    const tasksHeight = exp.tasks.length * 20;
                    return acc + 50 + tasksHeight + 20; // +20 padding
                }, 0)
            });
        }

        // Education
        if (profile.educations.length > 0) {
            sections.push({
                id: 'education',
                type: 'education',
                title: 'Education',
                items: profile.educations,
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
                title: 'Skills',
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
