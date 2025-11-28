import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CVState } from './slices/types';
import { createProfileSlice } from './slices/profile-slice';
import { createExperienceSlice } from './slices/experience-slice';
import { createEducationSlice } from './slices/education-slice';
import { createLetterSlice } from './slices/letter-slice';
import { createStorageSlice } from './slices/storage-slice';
import { mapInitialData } from './initial-data-mapper';

export const useCVStore = create<CVState>()(
    persist(
        (...a) => ({
            profile: mapInitialData(),
            ...createProfileSlice(...a),
            ...createExperienceSlice(...a),
            ...createEducationSlice(...a),
            ...createLetterSlice(...a),
            ...createStorageSlice(...a),
        }),
        {
            name: 'swiss-cv-storage',
        }
    )
);
