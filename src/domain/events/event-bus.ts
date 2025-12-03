
import { v4 as uuidv4 } from 'uuid';

export type EventType =
    | 'CV_UPDATED'
    | 'LAYOUT_CALCULATED'
    | 'PERFORMANCE_METRIC'
    | 'SYSTEM_ERROR'
    | 'USER_INTERACTION'
    | 'DRAG_START'
    | 'DRAG_END'
    | 'DROP_PREVIEW'
    | 'MODE_SWITCHED'
    | 'TEMPLATE_CHANGED';

export interface SystemEvent<T = any> {
    id: string;
    type: EventType;
    payload: T;
    timestamp: number;
}

type EventHandler<T = any> = (event: SystemEvent<T>) => void;

class EventBus {
    private handlers: Map<EventType, Set<EventHandler>> = new Map();

    subscribe<T>(type: EventType, handler: EventHandler<T>): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type)!.add(handler);

        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }

    publish<T>(type: EventType, payload: T): void {
        const event: SystemEvent<T> = {
            id: uuidv4(),
            type,
            payload,
            timestamp: Date.now(),
        };

        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                } catch (error) {
                    console.error(`Error in event handler for ${type}:`, error);
                }
            });
        }
    }
}

export const systemEventBus = new EventBus();
