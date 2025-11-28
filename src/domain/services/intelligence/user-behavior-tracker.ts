import { systemEventBus } from '../../events/event-bus';

export interface UserInteraction {
    type: 'SUGGESTION_ACCEPTED' | 'SUGGESTION_REJECTED' | 'TAB_CHANGED' | 'LAYOUT_SWITCHED' | 'FEATURE_USED';
    context?: string; // e.g., 'critic_tab', 'summary_editor'
    detail?: string; // e.g., 'grammar_fix', 'mobile_mode'
    timestamp: number;
}

export class UserBehaviorTracker {
    private static instance: UserBehaviorTracker;
    private interactions: UserInteraction[] = [];
    private readonly MAX_HISTORY = 1000;

    private constructor() {
        this.setupListeners();
    }

    static getInstance(): UserBehaviorTracker {
        if (!UserBehaviorTracker.instance) {
            UserBehaviorTracker.instance = new UserBehaviorTracker();
        }
        return UserBehaviorTracker.instance;
    }

    private setupListeners() {
        // Listen to relevant system events
        // For now, we'll expose a public method to track events manually from UI components
        // In the future, we can subscribe to more specific events from the bus
    }

    track(type: UserInteraction['type'], context?: string, detail?: string) {
        const interaction: UserInteraction = {
            type,
            context,
            detail,
            timestamp: Date.now()
        };

        this.interactions.push(interaction);
        if (this.interactions.length > this.MAX_HISTORY) {
            this.interactions.shift();
        }

        // Publish event for LearningModel to consume
        systemEventBus.publish('USER_INTERACTION', interaction);

        // Persist to local storage (debounced in real app, direct here for simplicity)
        this.persist();
    }

    getHistory(): UserInteraction[] {
        return [...this.interactions];
    }

    private persist() {
        try {
            localStorage.setItem('user_interactions', JSON.stringify(this.interactions.slice(-100)));
        } catch (e) {
            console.warn('Failed to persist user interactions', e);
        }
    }

    load() {
        try {
            const stored = localStorage.getItem('user_interactions');
            if (stored) {
                this.interactions = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load user interactions', e);
        }
    }
}

export const userTracker = UserBehaviorTracker.getInstance();
