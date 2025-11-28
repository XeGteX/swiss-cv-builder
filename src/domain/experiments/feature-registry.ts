import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FeatureStatus = 'alpha' | 'beta' | 'stable';

export interface Feature {
    id: string;
    name: string;
    description: string;
    status: FeatureStatus;
    defaultValue: boolean;
}

export const AVAILABLE_FEATURES: Feature[] = [
    {
        id: 'new_scoring_algo',
        name: 'Algorithme de Scoring v2',
        description: 'Utilise la similarité vectorielle avancée pour analyser le CV.',
        status: 'alpha',
        defaultValue: false
    },
    {
        id: 'generative_ui',
        name: 'Moteur UI Génératif',
        description: 'Active le nouveau moteur de templates paramétriques.',
        status: 'beta',
        defaultValue: false
    }
];

interface FeatureStore {
    features: Record<string, boolean>;
    toggleFeature: (featureId: string) => void;
    isFeatureEnabled: (featureId: string) => boolean;
}

export const useFeatureStore = create<FeatureStore>()(
    persist(
        (set, get) => ({
            features: {},
            toggleFeature: (featureId) => set((state) => ({
                features: {
                    ...state.features,
                    [featureId]: !state.features[featureId]
                }
            })),
            isFeatureEnabled: (featureId) => {
                const state = get();
                // Return user preference OR default value if not set
                if (state.features[featureId] !== undefined) {
                    return state.features[featureId];
                }
                const feature = AVAILABLE_FEATURES.find(f => f.id === featureId);
                return feature ? feature.defaultValue : false;
            }
        }),
        {
            name: 'feature-flags-storage',
        }
    )
);
