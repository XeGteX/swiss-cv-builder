import { describe, it, expect } from 'vitest';
import { DataSanitizer } from './sanitizer';
import { z } from 'zod';

describe('DataSanitizer', () => {
    describe('cleanText', () => {
        it('should remove markdown code blocks', () => {
            const input = '```json\n{"key": "value"}\n```';
            expect(DataSanitizer.cleanText(input)).toBe('{"key": "value"}');
        });

        it('should trim whitespace', () => {
            const input = '  hello  ';
            expect(DataSanitizer.cleanText(input)).toBe('hello');
        });
    });

    describe('safeParse', () => {
        const schema = z.object({
            name: z.string(),
            age: z.number(),
        });

        it('should parse valid JSON', () => {
            const input = '{"name": "John", "age": 30}';
            const result = DataSanitizer.safeParse(input, schema);
            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('should handle markdown wrapped JSON', () => {
            const input = '```json\n{"name": "John", "age": 30}\n```';
            const result = DataSanitizer.safeParse(input, schema);
            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('should return null for invalid JSON', () => {
            const input = 'invalid json';
            const result = DataSanitizer.safeParse(input, schema);
            expect(result).toBeNull();
        });

        it('should return null for schema mismatch', () => {
            const input = '{"name": "John", "age": "thirty"}';
            const result = DataSanitizer.safeParse(input, schema);
            expect(result).toBeNull();
        });
    });
});
