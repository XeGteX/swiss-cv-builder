import { describe, it, expect, beforeEach } from 'vitest';
import { useCVStore } from '../cv-store';

describe('CV Store', () => {
    beforeEach(() => {
        useCVStore.setState({
            profile: {
                id: 'test-id',
                personal: {
                    firstName: '',
                    lastName: '',
                    title: '',
                    contact: { email: '', phone: '', address: '' },
                    birthDate: '',
                    nationality: '',
                    permit: '',
                    mobility: ''
                },
                experiences: [],
                educations: [],
                skills: [],
                languages: [],
                summary: '',
                metadata: {
                    templateId: 'modern',
                    accentColor: '#000000',
                    fontFamily: 'sans',
                    layout: 'classic'
                }
            }
        });
    });

    it('should update personal info', () => {
        const { updatePersonal } = useCVStore.getState();

        updatePersonal({ firstName: 'John', lastName: 'Doe' });

        const { profile } = useCVStore.getState();
        expect(profile.personal.firstName).toBe('John');
        expect(profile.personal.lastName).toBe('Doe');
    });

    it('should update summary', () => {
        const { updateSummary } = useCVStore.getState();

        updateSummary('A great developer');

        const { profile } = useCVStore.getState();
        expect(profile.summary).toBe('A great developer');
    });
});
