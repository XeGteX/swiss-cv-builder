import EventEmitter from 'events';
import { LoggerService } from './logger-service';
class EventBus extends EventEmitter {
    constructor() {
        super();
        this.on('error', (err) => {
            LoggerService.error('❌ [EventBus] Uncaught error:', err);
        });
    }
    emit(event, ...args) {
        LoggerService.info(`📢 [EventBus] Emitting: ${event}`);
        return super.emit(event, ...args);
    }
}
export const eventBus = new EventBus();
// Standard Event Names
export const EVENTS = {
    USER: {
        REGISTERED: 'USER_REGISTERED',
        LOGIN: 'USER_LOGIN'
    },
    CV: {
        CREATED: 'CV_CREATED',
        UPDATED: 'CV_UPDATED'
    },
    SUBSCRIPTION: {
        UPGRADED: 'SUBSCRIPTION_UPGRADED',
        CANCELLED: 'SUBSCRIPTION_CANCELLED'
    }
};
