/**
 * NanoBrain Service V2 - The Ultimate CV Analyzer
 * 
 * 🧠 60+ Detection Rules
 * 🔍 Surgical Precision
 * 🌍 Multi-Country Compliance
 * 💼 Industry-Specific Analysis
 * 
 * NanoBrain is your CV's best antivirus. It catches EVERYTHING.
 */

import type { CVProfile } from '../../../domain/entities/cv';
import type { CountryCode } from '../../../domain/config/countryRules';
import { getCountryRules } from '../../../domain/config/countryRules';

// Import all detection modules
import {
    type DetectionIssue,
    detectTypographyIssues,
    detectContentIssues,
    detectRegionalIssues,
    detectChronologyIssues,
    detectContactIssues
} from './NanoBrainRules';

import {
    detectATSIssues,
    detectIndustryIssues,
    detectLanguageIssues
} from './NanoBrainAdvanced';

// ============================================================================
// TYPES
// ============================================================================

export interface NanoBrainAudit {
    score: number;
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    criticalErrors: DetectionIssue[];
    warnings: DetectionIssue[];
    improvements: DetectionIssue[];
    info: DetectionIssue[];
    totalIssues: number;
    categoryBreakdown: {
        typography: number;
        content: number;
        regional: number;
        chronology: number;
        contact: number;
        ats: number;
        industry: number;
        language: number;
    };
    timestamp: string;
    targetCountry: CountryCode;
    estimatedATSScore: number;
    readinessLevel: 'not_ready' | 'needs_work' | 'almost_ready' | 'ready' | 'excellent';
}

export type { DetectionIssue };

// ============================================================================
// NANO BRAIN SERVICE
// ============================================================================

export class NanoBrainService {
    /**
     * Run full CV analysis with all 60+ rules
     */
    static async analyzeResume(profile: CVProfile, targetCountry: CountryCode = 'FR'): Promise<NanoBrainAudit> {
        console.log('[NanoBrain] 🧠 Starting ultra-deep analysis...');
        const startTime = Date.now();

        // Collect all issues from all modules
        const allIssues: DetectionIssue[] = [
            ...detectTypographyIssues(profile),
            ...detectContentIssues(profile),
            ...detectRegionalIssues(profile, targetCountry),
            ...detectChronologyIssues(profile),
            ...detectContactIssues(profile),
            ...detectATSIssues(profile),
            ...detectIndustryIssues(profile),
            ...detectLanguageIssues(profile)
        ];

        // Categorize issues
        const criticalErrors = allIssues.filter(i => i.category === 'critical');
        const warnings = allIssues.filter(i => i.category === 'warning');
        const improvements = allIssues.filter(i => i.category === 'improvement');
        const info = allIssues.filter(i => i.category === 'info');

        // ========================================================================
        // AGGRESSIVE SCORING - Honest scoring where garbage CV = 0/100
        // ========================================================================

        // First: Check CV completeness - if fundamentals missing, max score is capped
        const hasName = !!(profile.personal?.firstName && profile.personal?.lastName);
        const hasTitle = !!profile.personal?.title;
        const hasEmail = !!profile.personal?.contact?.email;
        const hasSummary = !!(profile.summary && profile.summary.length >= 30);
        const hasExperience = !!(profile.experiences && profile.experiences.length > 0);
        const hasSkills = !!(profile.skills && profile.skills.length >= 3);

        // Calculate base completeness (0-100)
        const completenessFactors = [hasName, hasTitle, hasEmail, hasSummary, hasExperience, hasSkills];
        const completenessScore = completenessFactors.filter(Boolean).length / completenessFactors.length;

        // If completeness is below 50%, max score is severely capped
        let maxScore = 100;
        if (completenessScore < 0.5) {
            maxScore = 25; // Missing half the basics = max 25/100
        } else if (completenessScore < 0.7) {
            maxScore = 50; // Missing significant elements = max 50/100
        } else if (completenessScore < 1) {
            maxScore = 80; // Missing some elements = max 80/100
        }

        // Then subtract penalties from the max score
        let score = maxScore;
        for (const issue of allIssues) {
            score -= issue.scorePenalty;
        }

        // Apply a multiplier based on critical errors (each critical = -10% of remaining)
        if (criticalErrors.length > 0) {
            const criticalMultiplier = Math.max(0.3, 1 - (criticalErrors.length * 0.15));
            score = score * criticalMultiplier;
        }

        // Final clamp
        score = Math.max(0, Math.min(100, score));

        // Calculate category breakdown
        const categoryBreakdown = {
            typography: allIssues.filter(i => i.type === 'typography').length,
            content: allIssues.filter(i => i.type === 'content').length,
            regional: allIssues.filter(i => i.type === 'regional').length,
            chronology: allIssues.filter(i => i.type === 'chronology').length,
            contact: allIssues.filter(i => i.type === 'contact').length,
            ats: allIssues.filter(i => i.type === 'ats').length,
            industry: allIssues.filter(i => i.type === 'industry').length,
            language: allIssues.filter(i => i.type === 'language').length
        };

        // Calculate ATS score (separate from visual score)
        const atsIssues = allIssues.filter(i => i.type === 'ats' || i.type === 'typography');
        let atsScore = 100;
        for (const issue of atsIssues) {
            atsScore -= issue.scorePenalty * 1.5; // ATS is stricter
        }
        atsScore = Math.max(0, Math.min(100, atsScore));

        // Determine grade
        const grade = scoreToGrade(score);

        // Determine readiness level
        const readinessLevel = determineReadiness(score, criticalErrors.length);

        const elapsed = Date.now() - startTime;
        console.log(`[NanoBrain] ✅ Analysis complete in ${elapsed}ms | Score: ${score} | Issues: ${allIssues.length}`);

        return {
            score: Math.round(score),
            grade,
            criticalErrors,
            warnings,
            improvements,
            info,
            totalIssues: allIssues.length,
            categoryBreakdown,
            timestamp: new Date().toISOString(),
            targetCountry,
            estimatedATSScore: Math.round(atsScore),
            readinessLevel
        };
    }

    /**
     * Generate human-readable coach report
     */
    static generateCoachReport(audit: NanoBrainAudit, userName: string = 'utilisateur'): string {
        const rules = getCountryRules(audit.targetCountry);

        let report = `# 🧠 Rapport NanoBrain pour ${userName}\n\n`;
        report += `**Score Global: ${audit.score}/100** (${audit.grade})\n`;
        report += `**Score ATS: ${audit.estimatedATSScore}/100**\n`;
        report += `**Marché cible: ${rules.name}**\n\n`;

        // Readiness indicator
        const readinessEmoji: Record<string, string> = {
            'not_ready': '🔴 Non prêt',
            'needs_work': '🟠 Nécessite du travail',
            'almost_ready': '🟡 Presque prêt',
            'ready': '🟢 Prêt à envoyer',
            'excellent': '🏆 Excellent!'
        };
        report += `**Statut: ${readinessEmoji[audit.readinessLevel]}**\n\n`;

        report += `---\n\n`;
        report += `## 📊 Résumé\n\n`;
        report += `| Catégorie | Problèmes |\n`;
        report += `|-----------|----------|\n`;
        report += `| 🔴 Erreurs critiques | ${audit.criticalErrors.length} |\n`;
        report += `| 🟠 Avertissements | ${audit.warnings.length} |\n`;
        report += `| 🔵 Améliorations | ${audit.improvements.length} |\n`;
        report += `| ℹ️ Infos | ${audit.info.length} |\n\n`;

        // Critical errors (MUST FIX)
        if (audit.criticalErrors.length > 0) {
            report += `## 🚨 ERREURS CRITIQUES (à corriger immédiatement)\n\n`;
            for (const error of audit.criticalErrors) {
                report += `### ❌ ${error.message}\n`;
                if (error.field) report += `📍 Champ: \`${error.field}\`\n`;
                if (error.suggestion) report += `💡 **Solution:** ${error.suggestion}\n`;
                report += `⚠️ Impact: -${error.scorePenalty} points\n\n`;
            }
        }

        // Warnings
        if (audit.warnings.length > 0) {
            report += `## ⚠️ AVERTISSEMENTS\n\n`;
            for (const warning of audit.warnings) {
                report += `- **${warning.message}**`;
                if (warning.suggestion) report += ` → ${warning.suggestion}`;
                report += ` (-${warning.scorePenalty}pts)\n`;
            }
            report += '\n';
        }

        // Improvements
        if (audit.improvements.length > 0) {
            report += `## 💡 AMÉLIORATIONS SUGGÉRÉES\n\n`;
            for (const imp of audit.improvements) {
                report += `- ${imp.message}`;
                if (imp.suggestion) report += `: ${imp.suggestion}`;
                report += '\n';
            }
            report += '\n';
        }

        // Info tips
        if (audit.info.length > 0) {
            report += `## ℹ️ CONSEILS\n\n`;
            for (const tip of audit.info) {
                report += `- ${tip.message}`;
                if (tip.suggestion) report += ` - ${tip.suggestion}`;
                report += '\n';
            }
            report += '\n';
        }

        // Category breakdown
        report += `## 📈 Détail par catégorie\n\n`;
        const cats = [
            { name: 'Typographie', count: audit.categoryBreakdown.typography, emoji: '📝' },
            { name: 'Contenu', count: audit.categoryBreakdown.content, emoji: '📄' },
            { name: 'Conformité pays', count: audit.categoryBreakdown.regional, emoji: '🌍' },
            { name: 'Chronologie', count: audit.categoryBreakdown.chronology, emoji: '📅' },
            { name: 'Contact', count: audit.categoryBreakdown.contact, emoji: '📧' },
            { name: 'Compatibilité ATS', count: audit.categoryBreakdown.ats, emoji: '🤖' },
            { name: 'Spécifique secteur', count: audit.categoryBreakdown.industry, emoji: '💼' },
            { name: 'Langue/Grammaire', count: audit.categoryBreakdown.language, emoji: '🔤' }
        ];

        for (const cat of cats) {
            const status = cat.count === 0 ? '✅' : cat.count <= 2 ? '⚠️' : '❌';
            report += `${cat.emoji} ${cat.name}: ${status} (${cat.count} problèmes)\n`;
        }

        report += `\n---\n`;
        report += `*Rapport généré par NanoBrain v2.0 - ${new Date().toLocaleString('fr-FR')}*\n`;

        return report;
    }

    /**
     * Quick check - Returns just the score and critical issues
     */
    static quickCheck(profile: CVProfile, country: CountryCode = 'FR'): { score: number; criticalCount: number; topIssue: string | null } {
        const issues = [
            ...detectContactIssues(profile),
            ...detectRegionalIssues(profile, country),
            ...detectContentIssues(profile)
        ];

        const critical = issues.filter(i => i.category === 'critical');
        let score = 100;
        for (const issue of issues) {
            score -= issue.scorePenalty;
        }

        return {
            score: Math.max(0, Math.round(score)),
            criticalCount: critical.length,
            topIssue: critical[0]?.message || null
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function scoreToGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    return 'F';
}

function determineReadiness(score: number, criticalCount: number): NanoBrainAudit['readinessLevel'] {
    if (criticalCount > 3) return 'not_ready';
    if (criticalCount > 0 || score < 50) return 'needs_work';
    if (score < 70) return 'almost_ready';
    if (score < 90) return 'ready';
    return 'excellent';
}

export default NanoBrainService;
