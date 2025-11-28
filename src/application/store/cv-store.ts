import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type CVProfile, type Experience, type Education, type PersonalInfo, type Letter } from '../../domain/entities/cv';
import { initialDataFr } from '../../data/initialData';
import { v4 as uuidv4 } from 'uuid';
import { DemoProfileGenerator } from '../../domain/services/demo-data/demo-generator';
import { useSettingsStore } from './settings-store';
import { useAuthStore } from './auth-store';
import { LocalStorageService } from '../services/storage/local-storage-service';
import { CloudStorageService } from '../services/storage/cloud-storage-service';
import { type StorageService } from '../services/storage/storage-service';

// Helper to map legacy data to new schema if needed
const mapInitialData = (): CVProfile => {
    return {
        id: uuidv4(),
        lastUpdated: Date.now(),
        personal: {
            ...initialDataFr.personal,
            contact: {
                email: initialDataFr.personal.email,
                phone: initialDataFr.personal.phone,
                address: initialDataFr.personal.address,
            }
        },
        summary: initialDataFr.summary,
        experiences: initialDataFr.experience.map(e => ({
            ...e,
            id: String(e.id),
            dates: e.dates,
            tasks: e.tasks
        })),
        educations: initialDataFr.education.map(e => ({
            ...e,
            id: String(e.id),
            year: e.year,
            degree: e.degree,
            school: e.school
        })),
        languages: initialDataFr.languages,
        skills: initialDataFr.skills,
        strengths: initialDataFr.strengths,
        metadata: {
            templateId: 'modern',
            density: 'comfortable',
            accentColor: '#2563eb',
            fontFamily: 'sans',
        }
    };
};

interface CVState {
    profile: CVProfile;
    updatePersonal: (data: Partial<PersonalInfo>) => void;
    updateSummary: (summary: string) => void;
    addExperience: () => void;
    updateExperience: (id: string, data: Partial<Experience>) => void;
    removeExperience: (id: string) => void;
    addEducation: () => void;
    updateEducation: (id: string, data: Partial<Education>) => void;
    removeEducation: (id: string) => void;
    updateMetadata: (data: Partial<CVProfile['metadata']>) => void;
    setFullProfile: (profile: CVProfile) => void;
    updateProfile: (data: Partial<CVProfile>) => void;
    updateLetter: (letter: string) => void; // Legacy
    saveLetter: (letter: Letter) => void;
    deleteLetter: (id: string) => void;
    loadDemoProfile: (language?: 'en' | 'fr') => void;
    resetToDefault: () => void;

    // Storage Actions
    syncData: () => Promise<void>;
}

const localService = new LocalStorageService();
const cloudService = new CloudStorageService();

const getStorageService = (): StorageService => {
    const { storageMode } = useSettingsStore.getState();
    const { isAuthenticated } = useAuthStore.getState();

    if (storageMode === 'cloud' && isAuthenticated) {
        return cloudService;
    }
    return localService;
};

export const useCVStore = create<CVState>()(
    persist(
        (set) => ({
            profile: mapInitialData(),

            updatePersonal: (data) => {
                set((state) => {
                    const newProfile = { ...state.profile, personal: { ...state.profile.personal, ...data } };
                    getStorageService().saveProfile(newProfile).catch(console.error);
                    return { profile: newProfile };
                });
            },

            updateSummary: (summary) => {
                set((state) => {
                    const newProfile = { ...state.profile, summary };
                    getStorageService().saveProfile(newProfile).catch(console.error);
                    return { profile: newProfile };
                });
            },

            updateLetter: (letter) => set((state) => ({
                profile: { ...state.profile, letter }
            })),

            saveLetter: (letter) => {
                set((state) => {
                    const existing = state.profile.letters || [];
                    const index = existing.findIndex(l => l.id === letter.id);
                    let newLetters;
                    if (index >= 0) {
                        newLetters = [...existing];
                        newLetters[index] = letter;
                    } else {
                        newLetters = [letter, ...existing];
                    }
                    const newProfile = { ...state.profile, letters: newLetters };

                    // Save letter individually for cloud optimization, or full profile for local
                    const service = getStorageService();
                    service.saveLetter(letter).catch(console.error);
                    if (service instanceof LocalStorageService) {
                        service.saveProfile(newProfile).catch(console.error);
                    }

                    return { profile: newProfile };
                });
            },

            deleteLetter: (id) => {
                set((state) => {
                    const newProfile = {
                        ...state.profile,
                        letters: (state.profile.letters || []).filter(l => l.id !== id)
                    };

                    const service = getStorageService();
                    service.deleteLetter(id).catch(console.error);
                    if (service instanceof LocalStorageService) {
                        service.saveProfile(newProfile).catch(console.error);
                    }

                    return { profile: newProfile };
                });
            },

            addExperience: () => set((state) => {
                const newProfile = {
                    ...state.profile,
                    experiences: [
                        ...state.profile.experiences,
                        {
                            id: uuidv4(),
                            role: '',
                            company: '',
                            dates: '',
                            tasks: [''],
                        }
                    ]
                };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            updateExperience: (id, data) => set((state) => {
                const newProfile = {
                    ...state.profile,
                    experiences: state.profile.experiences.map(exp =>
                        exp.id === id ? { ...exp, ...data } : exp
                    )
                };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            removeExperience: (id) => set((state) => {
                const newProfile = {
                    ...state.profile,
                    experiences: state.profile.experiences.filter(exp => exp.id !== id)
                };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            addEducation: () => set((state) => {
                const newProfile = {
                    ...state.profile,
                    educations: [
                        ...state.profile.educations,
                        {
                            id: uuidv4(),
                            degree: '',
                            school: '',
                            year: '',
                        }
                    ]
                };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            updateEducation: (id, data) => set((state) => {
                const newProfile = {
                    ...state.profile,
                    educations: state.profile.educations.map(edu =>
                        edu.id === id ? { ...edu, ...data } : edu
                    )
                };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            removeEducation: (id) => set((state) => {
                const newProfile = {
                    ...state.profile,
                    educations: state.profile.educations.filter(edu => edu.id !== id)
                };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            updateMetadata: (data) => set((state) => {
                const newProfile = {
                    ...state.profile,
                    metadata: { ...state.profile.metadata, ...data }
                };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            setFullProfile: (profile) => set({ profile }),

            updateProfile: (data) => set((state) => {
                const newProfile = { ...state.profile, ...data };
                getStorageService().saveProfile(newProfile).catch(console.error);
                return { profile: newProfile };
            }),

            loadDemoProfile: (language = 'en') => {
                const demoProfile = DemoProfileGenerator.generateProfile(language);
                set({ profile: demoProfile });
                getStorageService().saveProfile(demoProfile).catch(console.error);
            },

            resetToDefault: () => {
                const newProfile = mapInitialData();
                set({ profile: newProfile });
                getStorageService().saveProfile(newProfile).catch(console.error);
            },

            syncData: async () => {
                const service = getStorageService();
                try {
                    const profile = await service.loadProfile();
                    if (profile) {
                        set({ profile });
                    }
                    const letters = await service.loadLetters();
                    if (letters && letters.length > 0) {
                        set(state => ({ profile: { ...state.profile, letters } }));
                    }
                } catch (error) {
                    console.error('Sync failed:', error);
                }
            }
        }),
        {
            name: 'swiss-cv-storage',
            // We can keep persist for local caching, but we also manually call storage service
        }
    )
);
