
type Handler<T = any> = (event: T) => void;

class EventBus {
    private handlers: Map<string, Handler[]> = new Map();

    on<T>(type: string, handler: Handler<T>): void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type)?.push(handler);
    }

    off<T>(type: string, handler: Handler<T>): void {
        const handlers = this.handlers.get(type);
        if (handlers) {
            this.handlers.set(type, handlers.filter(h => h !== handler));
        }
    }

    emit<T>(type: string, event: T): void {
        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.forEach(handler => handler(event));
        }
    }
}

export const eventBus = new EventBus();

// Define known events for type safety
export const AppEvents = {
    NOTIFICATION: 'APP:NOTIFICATION',
    AI_ANALYSIS_COMPLETE: 'AI:ANALYSIS_COMPLETE',
    PAYMENT_SUCCESS: 'PAYMENT:SUCCESS',
} as const;

export type AppEvents = typeof AppEvents[keyof typeof AppEvents];
