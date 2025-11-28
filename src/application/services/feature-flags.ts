type FeatureFlag = 'ENABLE_WIZARD' | 'ENABLE_AI_V2' | 'ENABLE_CLOUD_STORAGE' | 'ENABLE_PAYMENTS';

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
    ENABLE_WIZARD: true,
    ENABLE_AI_V2: false, // Not ready yet
    ENABLE_CLOUD_STORAGE: true,
    ENABLE_PAYMENTS: true,
};

export const FeatureFlags = {
    isEnabled: (flag: FeatureFlag): boolean => {
        // Can be enhanced to read from env vars or remote config
        return DEFAULT_FLAGS[flag];
    },

    getAll: () => DEFAULT_FLAGS,
};
