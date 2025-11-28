import type { GenerationContext, LetterSection } from './letter-types';
import { LocalMemory } from '../services/local-learning/local-memory';

export interface GeneratedLetter {
    content: string;
    usedSectionIds: string[];
}

export class LetterGenerator {
    static generate(context: GenerationContext): GeneratedLetter {
        const sections = LocalMemory.getSections();

        // Filter by language
        const langSections = sections.filter(s => s.language === context.language);

        const intro = this.selectSection(langSections, 'intro', context);
        const body = this.selectSection(langSections, 'body', context);
        const conclusion = this.selectSection(langSections, 'conclusion', context);

        if (!intro || !body || !conclusion) {
            throw new Error('Insufficient templates for generation');
        }

        const rawContent = [intro.content, body.content, conclusion.content].join('\n\n');
        const filledContent = this.fillPlaceholders(rawContent, context);

        return {
            content: filledContent,
            usedSectionIds: [intro.id, body.id, conclusion.id]
        };
    }

    private static selectSection(sections: LetterSection[], type: 'intro' | 'body' | 'conclusion', _context: GenerationContext): LetterSection | undefined {
        const candidates = sections.filter(s => s.type === type);
        if (candidates.length === 0) return undefined;

        // Weighted random selection
        const totalWeight = candidates.reduce((sum, s) => sum + s.weight, 0);
        let random = Math.random() * totalWeight;

        for (const section of candidates) {
            random -= section.weight;
            if (random <= 0) return section;
        }
        return candidates[0];
    }

    private static fillPlaceholders(template: string, context: GenerationContext): string {
        let text = template;
        text = text.replace(/{{role}}/g, context.jobTitle);
        text = text.replace(/{{company}}/g, context.companyName);

        // Join skills naturally
        const skillsStr = context.candidateSkills.slice(0, 3).join(', ');
        text = text.replace(/{{skills}}/g, skillsStr || (context.language === 'fr' ? 'mes compétences' : 'my skills'));

        return text;
    }
}
