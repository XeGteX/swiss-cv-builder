import { useCallback, useMemo } from 'react';
import { create } from 'zustand';

// Types for gate features
export type GatedFeature = 'AI_GENERATION' | 'PREMIUM_TEMPLATE' | 'PUBLISH_LINK';

// Subscription plans
export type SubscriptionPlan = 'free' | 'sprint' | 'campagne' | 'pro';

// Gate trigger source for dynamic modal text
export type GateTriggerSource =
    | 'ai_generation'
    | 'premium_template'
    | 'publish_link'
    | 'download_limit'
    | 'ai_trial_expired';

// Plan pricing
export const PLAN_PRICING = {
    sprint: { price: 2.99, period: '7 jours', downloads: 5, features: ['5 téléchargements', 'Templates basiques', 'Support email'] },
    campagne: { price: 5.99, period: '30 jours', downloads: 20, features: ['20 téléchargements', 'Tous les templates', 'IA illimitée', 'Support prioritaire'] },
    pro: { price: 9.99, period: '30 jours', downloads: -1, features: ['Téléchargements illimités', 'Tous les templates', 'IA illimitée', 'Lien public permanent', 'Support VIP'] }
} as const;

// Feature access per plan
const PLAN_ACCESS: Record<SubscriptionPlan, GatedFeature[]> = {
    free: [],
    sprint: ['PREMIUM_TEMPLATE'],
    campagne: ['AI_GENERATION', 'PREMIUM_TEMPLATE'],
    pro: ['AI_GENERATION', 'PREMIUM_TEMPLATE', 'PUBLISH_LINK']
};

// Local storage keys
const STORAGE_KEYS = {
    AI_TRIAL_COUNT: 'nexal_ai_trial_count',
    SUBSCRIPTION_PLAN: 'nexal_subscription_plan',
    SUBSCRIPTION_EXPIRY: 'nexal_subscription_expiry',
    SAVE_COUNT: 'nexal_save_count',
    HAS_RATED: 'nexal_has_rated'
} as const;

// Upsell Modal Store
interface UpsellModalState {
    isOpen: boolean;
    triggerSource: GateTriggerSource | null;
    openModal: (source: GateTriggerSource) => void;
    closeModal: () => void;
}

export const useUpsellModalStore = create<UpsellModalState>((set) => ({
    isOpen: false,
    triggerSource: null,
    openModal: (source) => set({ isOpen: true, triggerSource: source }),
    closeModal: () => set({ isOpen: false, triggerSource: null })
}));

/**
 * useGate - The Guardian Hook
 * Controls access to gated features based on subscription status
 */
export const useGate = () => {
    const { openModal } = useUpsellModalStore();

    // Get current subscription status
    const getSubscriptionStatus = useCallback((): { plan: SubscriptionPlan; isActive: boolean } => {
        const plan = (localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_PLAN) as SubscriptionPlan) || 'free';
        const expiry = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY);

        if (plan === 'free') {
            return { plan: 'free', isActive: false };
        }

        if (expiry) {
            const expiryDate = new Date(expiry);
            const now = new Date();
            if (now > expiryDate) {
                // Subscription expired, reset to free
                localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PLAN, 'free');
                localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY);
                return { plan: 'free', isActive: false };
            }
        }

        return { plan, isActive: true };
    }, []);

    // Check if a feature is allowed
    const isFeatureAllowed = useCallback((feature: GatedFeature): boolean => {
        const { plan, isActive } = getSubscriptionStatus();

        if (!isActive && plan === 'free') {
            // Special case: AI has 1 free trial
            if (feature === 'AI_GENERATION') {
                const trialCount = parseInt(localStorage.getItem(STORAGE_KEYS.AI_TRIAL_COUNT) || '0', 10);
                return trialCount < 1;
            }
            return false;
        }

        return PLAN_ACCESS[plan].includes(feature);
    }, [getSubscriptionStatus]);

    // Get AI trial status
    const getAITrialStatus = useCallback((): { used: number; remaining: number } => {
        const used = parseInt(localStorage.getItem(STORAGE_KEYS.AI_TRIAL_COUNT) || '0', 10);
        return { used, remaining: Math.max(0, 1 - used) };
    }, []);

    // Consume AI trial
    const consumeAITrial = useCallback(() => {
        const current = parseInt(localStorage.getItem(STORAGE_KEYS.AI_TRIAL_COUNT) || '0', 10);
        localStorage.setItem(STORAGE_KEYS.AI_TRIAL_COUNT, String(current + 1));
    }, []);

    // Trigger upsell modal
    const triggerUpsell = useCallback((source: GateTriggerSource) => {
        openModal(source);
    }, [openModal]);

    // Check gate and trigger upsell if blocked
    const checkGate = useCallback((feature: GatedFeature): { allowed: boolean; triggerUpsell: () => void } => {
        const allowed = isFeatureAllowed(feature);

        const sourceMap: Record<GatedFeature, GateTriggerSource> = {
            'AI_GENERATION': getAITrialStatus().remaining === 0 ? 'ai_trial_expired' : 'ai_generation',
            'PREMIUM_TEMPLATE': 'premium_template',
            'PUBLISH_LINK': 'publish_link'
        };

        return {
            allowed,
            triggerUpsell: () => triggerUpsell(sourceMap[feature])
        };
    }, [isFeatureAllowed, triggerUpsell, getAITrialStatus]);

    // Set subscription (for testing or after payment)
    const setSubscription = useCallback((plan: SubscriptionPlan, days: number = 30) => {
        if (plan === 'free') {
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PLAN, 'free');
            localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY);
        } else {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + days);
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PLAN, plan);
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_EXPIRY, expiry.toISOString());
        }
    }, []);

    return useMemo(() => ({
        // Status checks
        getSubscriptionStatus,
        isFeatureAllowed,
        getAITrialStatus,

        // Actions
        consumeAITrial,
        triggerUpsell,
        checkGate,
        setSubscription,

        // Constants
        PLAN_PRICING
    }), [getSubscriptionStatus, isFeatureAllowed, getAITrialStatus, consumeAITrial, triggerUpsell, checkGate, setSubscription]);
};

/**
 * useSmartReview - Smart Review System Hook
 * Shows rating toast after 2+ saves
 */
export const useSmartReview = () => {
    const getSaveCount = useCallback((): number => {
        return parseInt(localStorage.getItem(STORAGE_KEYS.SAVE_COUNT) || '0', 10);
    }, []);

    const incrementSaveCount = useCallback(() => {
        const current = getSaveCount();
        localStorage.setItem(STORAGE_KEYS.SAVE_COUNT, String(current + 1));
        return current + 1;
    }, [getSaveCount]);

    const hasRated = useCallback((): boolean => {
        return localStorage.getItem(STORAGE_KEYS.HAS_RATED) === 'true';
    }, []);

    const markAsRated = useCallback(() => {
        localStorage.setItem(STORAGE_KEYS.HAS_RATED, 'true');
    }, []);

    const shouldShowReviewPrompt = useCallback((): boolean => {
        return getSaveCount() >= 2 && !hasRated();
    }, [getSaveCount, hasRated]);

    return {
        getSaveCount,
        incrementSaveCount,
        hasRated,
        markAsRated,
        shouldShowReviewPrompt
    };
};

export default useGate;
