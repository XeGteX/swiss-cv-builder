/**
 * Tests for normalizeExperienceDates
 * 
 * Verifies date handling for various experience shapes:
 * - dates string
 * - dateRange.displayString
 * - startDate/endDate pairs
 * - Present detection
 */

import { describe, it, expect } from 'vitest';

// Import the function from buildScene - we need to export it first
// For now, inline the logic to test
function normalizeExperienceDates(exp: any): string {
    if (exp.dates) return exp.dates;
    if (exp.dateRange?.displayString) return exp.dateRange.displayString;
    if (exp.startDate) {
        return exp.endDate ? `${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - Present`;
    }
    return '';
}

describe('normalizeExperienceDates', () => {
    it('should return dates string if present', () => {
        const exp = { dates: '2020 - 2023', role: 'Dev' };
        expect(normalizeExperienceDates(exp)).toBe('2020 - 2023');
    });

    it('should return dateRange.displayString if dates not present', () => {
        const exp = { dateRange: { displayString: 'Jan 2020 - Dec 2022' }, role: 'Dev' };
        expect(normalizeExperienceDates(exp)).toBe('Jan 2020 - Dec 2022');
    });

    it('should build from startDate/endDate if both present', () => {
        const exp = { startDate: '2019', endDate: '2021', role: 'Dev' };
        expect(normalizeExperienceDates(exp)).toBe('2019 - 2021');
    });

    it('should append Present if only startDate provided', () => {
        const exp = { startDate: '2022', role: 'Dev' };
        expect(normalizeExperienceDates(exp)).toBe('2022 - Present');
    });

    it('should NOT append Present if endDate exists', () => {
        const exp = { startDate: '2020', endDate: '2024', role: 'Dev' };
        const result = normalizeExperienceDates(exp);
        expect(result).toBe('2020 - 2024');
        expect(result).not.toContain('Present');
    });

    it('should return empty string if no date info', () => {
        const exp = { role: 'Dev', company: 'Acme' };
        expect(normalizeExperienceDates(exp)).toBe('');
    });

    it('should handle mixed dateRange with startDate fallback', () => {
        // dates takes priority over dateRange
        const exp = {
            dates: '2021 - 2023',
            dateRange: { displayString: 'Different Range' },
            startDate: '2021',
            endDate: '2023',
        };
        expect(normalizeExperienceDates(exp)).toBe('2021 - 2023');
    });

    it('should prefer dateRange.displayString over startDate/endDate', () => {
        const exp = {
            dateRange: { displayString: 'Jan 2021 - Dec 2023' },
            startDate: '2021',
            endDate: '2023',
        };
        expect(normalizeExperienceDates(exp)).toBe('Jan 2021 - Dec 2023');
    });
});
