/**
 * Multi-Format Export Service
 * 
 * Export CV to multiple formats:
 * - PDF (existing)
 * - Word/DOCX (new)
 * - LinkedIn optimized text (new)
 * - Plain text (new)
 * - JSON (for backup/import)
 */

import type { CVProfile } from '../../../domain/entities/cv';

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'pdf' | 'docx' | 'linkedin' | 'txt' | 'json';

export interface ExportOptions {
    format: ExportFormat;
    includePhoto?: boolean;
    language?: string;
}

export interface ExportResult {
    success: boolean;
    data?: Blob | string;
    filename?: string;
    error?: string;
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export class MultiFormatExportService {

    // ========================================================================
    // LINKEDIN FORMAT - Optimized for LinkedIn profile
    // ========================================================================

    static exportToLinkedIn(profile: CVProfile): ExportResult {
        try {
            const lines: string[] = [];

            // Headline
            if (profile.personal?.title) {
                lines.push(`🎯 ${profile.personal.title}`);
                lines.push('');
            }

            // About/Summary
            if (profile.summary) {
                lines.push('📝 À PROPOS');
                lines.push(profile.summary);
                lines.push('');
            }

            // Key Skills (formatted for LinkedIn)
            if (profile.skills?.length) {
                lines.push('💡 COMPÉTENCES CLÉS');
                const skillChunks = [];
                for (let i = 0; i < profile.skills.length; i += 4) {
                    const chunk = profile.skills.slice(i, i + 4);
                    skillChunks.push(chunk.join(' • '));
                }
                lines.push(skillChunks.join('\n'));
                lines.push('');
            }

            // Experience highlights
            if (profile.experiences?.length) {
                lines.push('💼 EXPÉRIENCE');
                profile.experiences.slice(0, 3).forEach(exp => {
                    lines.push(`▸ ${exp.role} @ ${exp.company}`);
                    const taskDesc = exp.tasks?.join(' ');
                    if (taskDesc) {
                        // Take first 150 chars
                        const shortDesc = taskDesc.slice(0, 150) + (taskDesc.length > 150 ? '...' : '');
                        lines.push(`  ${shortDesc}`);
                    }
                });
                lines.push('');
            }

            // Call to action
            lines.push('📩 Ouvert aux opportunités ! Contactez-moi.');
            lines.push('');
            lines.push('#OpenToWork #Hiring #' + (profile.personal?.title?.replace(/\s+/g, '') || 'Professional'));

            return {
                success: true,
                data: lines.join('\n'),
                filename: `cv-linkedin-${Date.now()}.txt`
            };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    // ========================================================================
    // PLAIN TEXT FORMAT
    // ========================================================================

    static exportToText(profile: CVProfile): ExportResult {
        try {
            const lines: string[] = [];

            // Header
            const name = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();
            lines.push('='.repeat(60));
            lines.push(name.toUpperCase() || 'CV');
            if (profile.personal?.title) {
                lines.push(profile.personal.title);
            }
            lines.push('='.repeat(60));
            lines.push('');

            // Contact
            if (profile.personal?.contact) {
                lines.push('CONTACT');
                lines.push('-'.repeat(30));
                if (profile.personal.contact.email) lines.push(`Email: ${profile.personal.contact.email}`);
                if (profile.personal.contact.phone) lines.push(`Tél: ${profile.personal.contact.phone}`);
                if (profile.personal.contact.address) lines.push(`Adresse: ${profile.personal.contact.address}`);
                if (profile.personal.contact.linkedin) lines.push(`LinkedIn: ${profile.personal.contact.linkedin}`);
                lines.push('');
            }

            // Summary
            if (profile.summary) {
                lines.push('RÉSUMÉ');
                lines.push('-'.repeat(30));
                lines.push(profile.summary);
                lines.push('');
            }

            // Experience
            if (profile.experiences?.length) {
                lines.push('EXPÉRIENCE PROFESSIONNELLE');
                lines.push('-'.repeat(30));
                profile.experiences.forEach(exp => {
                    const dates = `${exp.dates || '?'}`;
                    lines.push(`${exp.role} | ${exp.company} | ${dates}`);
                    if (exp.tasks?.length) {
                        lines.push(exp.tasks.join('. '));
                    }
                    lines.push('');
                });
            }

            // Education
            if (profile.educations?.length) {
                lines.push('FORMATION');
                lines.push('-'.repeat(30));
                profile.educations.forEach(edu => {
                    lines.push(`${edu.degree} | ${edu.school} | ${edu.year || ''}`);
                });
                lines.push('');
            }

            // Skills
            if (profile.skills?.length) {
                lines.push('COMPÉTENCES');
                lines.push('-'.repeat(30));
                const skillNames = profile.skills;
                lines.push(skillNames.join(', '));
                lines.push('');
            }

            // Languages
            if (profile.languages?.length) {
                lines.push('LANGUES');
                lines.push('-'.repeat(30));
                profile.languages.forEach(lang => {
                    lines.push(`${lang.name}: ${lang.level}`);
                });
                lines.push('');
            }

            return {
                success: true,
                data: lines.join('\n'),
                filename: `cv-${name.replace(/\s+/g, '-').toLowerCase() || 'export'}-${Date.now()}.txt`
            };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    // ========================================================================
    // JSON FORMAT (Backup/Import)
    // ========================================================================

    static exportToJSON(profile: CVProfile): ExportResult {
        try {
            const data = JSON.stringify(profile, null, 2);
            const name = `${profile.personal?.firstName || ''}-${profile.personal?.lastName || ''}`.toLowerCase().replace(/\s+/g, '-') || 'cv';

            return {
                success: true,
                data: new Blob([data], { type: 'application/json' }),
                filename: `cv-backup-${name}-${Date.now()}.json`
            };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    // ========================================================================
    // DOCX FORMAT (Basic - using HTML to DOCX conversion)
    // ========================================================================

    static exportToDocx(profile: CVProfile): ExportResult {
        try {
            // Create HTML content that Word can open
            const name = `${profile.personal?.firstName || ''} ${profile.personal?.lastName || ''}`.trim();

            let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Calibri, Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #1a365d; margin-bottom: 5px; }
        h2 { color: #2c5282; border-bottom: 2px solid #2c5282; padding-bottom: 5px; margin-top: 25px; }
        .title { color: #4a5568; font-size: 18px; margin-bottom: 20px; }
        .contact { color: #718096; margin-bottom: 20px; }
        .experience { margin-bottom: 15px; }
        .exp-header { font-weight: bold; }
        .exp-dates { color: #718096; font-size: 14px; }
        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill { background: #e2e8f0; padding: 4px 12px; border-radius: 15px; font-size: 14px; }
    </style>
</head>
<body>
    <h1>${name || 'CV'}</h1>
    ${profile.personal?.title ? `<div class="title">${profile.personal.title}</div>` : ''}
    
    <div class="contact">
        ${profile.personal?.contact?.email ? `📧 ${profile.personal.contact.email}` : ''}
        ${profile.personal?.contact?.phone ? ` | 📱 ${profile.personal.contact.phone}` : ''}
        ${profile.personal?.contact?.linkedin ? ` | 💼 ${profile.personal.contact.linkedin}` : ''}
    </div>

    ${profile.summary ? `<h2>Résumé</h2><p>${profile.summary}</p>` : ''}

    ${profile.experiences?.length ? `
        <h2>Expérience Professionnelle</h2>
        ${profile.experiences.map(exp => `
            <div class="experience">
                <div class="exp-header">${exp.role} - ${exp.company}</div>
                <div class="exp-dates">${exp.dates || ''}</div>
                ${exp.tasks?.length ? `<p>${exp.tasks.join('. ')}</p>` : ''}
            </div>
        `).join('')}
    ` : ''}

    ${profile.educations?.length ? `
        <h2>Formation</h2>
        ${profile.educations.map(edu => `
            <div class="experience">
                <div class="exp-header">${edu.degree}</div>
                <div class="exp-dates">${edu.school} - ${edu.year || ''}</div>
            </div>
        `).join('')}
    ` : ''}

    ${profile.skills?.length ? `
        <h2>Compétences</h2>
        <div class="skills">
            ${profile.skills.map(s => `<span class="skill">${s}</span>`).join('')}
        </div>
    ` : ''}

    ${profile.languages?.length ? `
        <h2>Langues</h2>
        <ul>
            ${profile.languages.map(lang => `<li>${lang.name}: ${lang.level}</li>`).join('')}
        </ul>
    ` : ''}
</body>
</html>`;

            const blob = new Blob([html], { type: 'application/vnd.ms-word' });
            const filename = `cv-${name.replace(/\s+/g, '-').toLowerCase() || 'export'}-${Date.now()}.doc`;

            return {
                success: true,
                data: blob,
                filename
            };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }

    // ========================================================================
    // MAIN EXPORT METHOD
    // ========================================================================

    static async export(profile: CVProfile, options: ExportOptions): Promise<ExportResult> {
        switch (options.format) {
            case 'linkedin':
                return this.exportToLinkedIn(profile);
            case 'txt':
                return this.exportToText(profile);
            case 'json':
                return this.exportToJSON(profile);
            case 'docx':
                return this.exportToDocx(profile);
            case 'pdf':
                // PDF export exists elsewhere in the app
                return { success: false, error: 'Use existing PDF export service' };
            default:
                return { success: false, error: `Unknown format: ${options.format}` };
        }
    }

    // ========================================================================
    // DOWNLOAD HELPER
    // ========================================================================

    static download(result: ExportResult): void {
        if (!result.success || !result.data || !result.filename) {
            console.error('Export failed:', result.error);
            return;
        }

        const blob = result.data instanceof Blob
            ? result.data
            : new Blob([result.data], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export default MultiFormatExportService;
