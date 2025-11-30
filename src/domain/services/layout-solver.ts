
import type { CVProfile } from '../entities/cv';

export interface LayoutConstraints {
    minFontSize: number;
    maxFontSize: number;
    targetHeight: number; // e.g., 1123 for A4 at 96 DPI
}

export interface LayoutSolution {
    fontSize: number;
    lineHeight: number;
    margin: number;
    score: number; // 0 to 1, where 1 is perfect fit
}

export class LayoutSolver {
    static solve(profile: CVProfile, constraints: LayoutConstraints): LayoutSolution {
        // Simplified heuristic for the "Speculative" phase.
        // In a real genetic algorithm, this would mutate parameters and measure height.

        const textLength = this.estimateTextLength(profile);
        const idealCharCount = 3000; // Rough estimate for A4

        // Linear interpolation for font size based on text length
        // More text = smaller font, but we keep it readable (min 10.5px)
        let fontSize = 11;
        let lineHeight = 1.5; // Default breathable line height
        let margin = 24; // Default generous margin

        if (textLength > idealCharCount) {
            const ratio = idealCharCount / textLength;
            // Compress gently
            fontSize = Math.max(constraints.minFontSize, 11 * ratio);
            lineHeight = Math.max(1.3, 1.5 * ratio); // Don't go below 1.3
            margin = Math.max(16, 24 * ratio);
        } else {
            const ratio = idealCharCount / textLength;
            // Expand for readability
            fontSize = Math.min(constraints.maxFontSize, 11 * Math.sqrt(ratio));
            lineHeight = Math.min(1.8, 1.5 * Math.sqrt(ratio)); // Cap at 1.8
            margin = Math.min(40, 24 * ratio);
        }

        return {
            fontSize: Number(fontSize.toFixed(2)),
            lineHeight: Number(lineHeight.toFixed(2)),
            margin: Number(margin.toFixed(2)),
            score: 0.95
        };
    }

    private static estimateTextLength(profile: CVProfile): number {
        let count = profile.summary?.length || 0;
        profile.experiences?.forEach(e => {
            // Experience entity doesn't have description, only tasks
            e.tasks?.forEach(t => count += t.length);
        });
        return count;
    }
}
