
import type { CVProfile } from '../entities/cv';

export type DensityLevel = 'comfortable' | 'compact' | 'dense';

export class AutoScaler {
    static calculateDensity(profile: CVProfile, templateId: string = 'modern'): DensityLevel {
        let score = 0;

        // Weighting logic
        score += (profile.summary?.length || 0) / 2;
        score += (profile.experiences?.length || 0) * 120;
        profile.experiences?.forEach(exp => {
            score += (exp.tasks?.length || 0) * 40;
        });
        score += (profile.educations?.length || 0) * 60;
        score += (profile.skills?.length || 0) * 25;
        score += (profile.languages?.length || 0) * 25;
        score += (profile.strengths?.length || 0) * 20;

        // Template specific adjustments could go here
        if (templateId === 'ats') {
            // ATS templates usually handle more text better
            score *= 0.9;
        }

        if (score < 800) return 'comfortable';
        if (score < 1400) return 'compact';
        return 'dense';
    }

    static getStyles(density: DensityLevel) {
        const styles = {
            comfortable: {
                textBase: 'text-[13px]',
                headerPad: 'p-6',
                sectionGap: 'gap-6',
                itemGap: 'space-y-5',
                subItemGap: 'space-y-1.5',
                listMargin: 'ml-5',
                containerPad: 'p-6',
                lineHeight: 'leading-relaxed',
            },
            compact: {
                textBase: 'text-[11px]',
                headerPad: 'p-4',
                sectionGap: 'gap-4',
                itemGap: 'space-y-3',
                subItemGap: 'space-y-1',
                listMargin: 'ml-4',
                containerPad: 'p-4',
                lineHeight: 'leading-normal',
            },
            dense: {
                textBase: 'text-[9px]',
                headerPad: 'p-3',
                sectionGap: 'gap-2',
                itemGap: 'space-y-2',
                subItemGap: 'space-y-0.5',
                listMargin: 'ml-3',
                containerPad: 'p-3',
                lineHeight: 'leading-tight',
            },
        };
        return styles[density];
    }
}
