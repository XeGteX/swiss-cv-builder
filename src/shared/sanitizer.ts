
import { NA_VALUES } from './constants';

export class DataSanitizer {
    static cleanText(value: any): string {
        if (!value && value !== 0) return '';
        let str = String(value).trim();

        // Remove markdown code blocks artifacts
        str = str.replace(/```json/g, '').replace(/```/g, '');

        if (!str) return '';
        if (NA_VALUES.includes(str.toLowerCase())) return '';
        return str.replace(/\s+/g, ' ').trim();
    }

    static cleanArray(arr: any[] | undefined): string[] {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(item => this.cleanText(item)).filter(Boolean);
    }

    static extractJSON(text: string): string {
        let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            clean = clean.substring(firstBrace, lastBrace + 1);
        }
        return clean;
    }

    static safeParse<T>(text: string, schema: { parse: (data: any) => T }): T | null {
        try {
            const jsonString = this.extractJSON(text);
            const rawData = JSON.parse(jsonString);
            // We can add a recursive cleaning step here if needed before schema validation
            return schema.parse(rawData);
        } catch (error) {
            console.error('JSON Parse/Validation Error:', error);
            return null;
        }
    }
}
