/**
 * Sprint 6.2: Education Adapter Mapping Tests
 * 
 * Tests that mapProfileToNexal2 correctly maps education fields
 * with robust key aliasing.
 */

import { describe, it, expect } from 'vitest';
import { mapProfileToNexal2 } from '../src/nexal2/adapters/mapAppToNexal2';

describe('mapProfileToNexal2 - Education Mapping', () => {
    it('should map standard fields: degree, school, year', () => {
        const profile = {
            id: 'test',
            version: 1,
            personal: { firstName: 'Test', lastName: 'User' },
            educations: [
                { degree: 'Master', school: 'MIT', year: '2020' },
                { degree: 'Bachelor', school: 'Stanford', year: '2018' },
            ],
        } as any;

        const mapped = mapProfileToNexal2(profile);

        expect(mapped.educations).toHaveLength(2);
        expect(mapped.educations?.[0]).toEqual({
            degree: 'Master',
            school: 'MIT',
            year: '2020',
        });
        expect(mapped.educations?.[1]).toEqual({
            degree: 'Bachelor',
            school: 'Stanford',
            year: '2018',
        });
    });

    it('should map aliased fields: diploma, establishment, dateFin', () => {
        const profile = {
            id: 'test',
            version: 1,
            personal: { firstName: 'Test', lastName: 'User' },
            educations: [
                { diploma: 'Licence', establishment: 'EPFL', dateFin: '2015' },
            ],
        } as any;

        const mapped = mapProfileToNexal2(profile);

        expect(mapped.educations).toHaveLength(1);
        expect(mapped.educations?.[0]).toEqual({
            degree: 'Licence',
            school: 'EPFL',
            year: '2015',
        });
    });

    it('should map aliased fields: title, institution, endYear', () => {
        const profile = {
            id: 'test',
            version: 1,
            personal: { firstName: 'Test', lastName: 'User' },
            educations: [
                { title: 'PhD', institution: 'Harvard', endYear: '2019' },
            ],
        } as any;

        const mapped = mapProfileToNexal2(profile);

        expect(mapped.educations).toHaveLength(1);
        expect(mapped.educations?.[0]).toEqual({
            degree: 'PhD',
            school: 'Harvard',
            year: '2019',
        });
    });

    it('should handle mixed aliased and standard fields', () => {
        const profile = {
            id: 'test',
            version: 1,
            personal: { firstName: 'Test', lastName: 'User' },
            educations: [
                { degree: 'MBA', institution: 'INSEAD', graduationYear: '2017' },
            ],
        } as any;

        const mapped = mapProfileToNexal2(profile);

        expect(mapped.educations?.[0]).toEqual({
            degree: 'MBA',
            school: 'INSEAD',
            year: '2017',
        });
    });

    it('should handle empty/null values gracefully', () => {
        const profile = {
            id: 'test',
            version: 1,
            personal: { firstName: 'Test', lastName: 'User' },
            educations: [
                { degree: null, school: undefined, year: '2021' },
            ],
        } as any;

        const mapped = mapProfileToNexal2(profile);

        expect(mapped.educations?.[0]).toEqual({
            degree: '',
            school: '',
            year: '2021',
        });
    });

    it('should trim whitespace from values', () => {
        const profile = {
            id: 'test',
            version: 1,
            personal: { firstName: 'Test', lastName: 'User' },
            educations: [
                { degree: '  Master  ', school: ' MIT ', year: ' 2020 ' },
            ],
        } as any;

        const mapped = mapProfileToNexal2(profile);

        expect(mapped.educations?.[0]).toEqual({
            degree: 'Master',
            school: 'MIT',
            year: '2020',
        });
    });
});

describe('mapProfileToNexal2 - Contact Mapping', () => {
    it('should preserve nested contact structure', () => {
        const profile = {
            id: 'test',
            version: 1,
            personal: {
                firstName: 'Jean',
                lastName: 'Dupont',
                contact: {
                    email: 'jean@test.com',
                    phone: '0612345678',
                    address: 'Paris, France',
                },
            },
        } as any;

        const mapped = mapProfileToNexal2(profile);

        expect(mapped.personal?.contact?.email).toBe('jean@test.com');
        expect(mapped.personal?.contact?.phone).toBe('0612345678');
        expect(mapped.personal?.contact?.address).toBe('Paris, France');
    });
});
