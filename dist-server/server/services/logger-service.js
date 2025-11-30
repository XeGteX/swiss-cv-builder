
export class LoggerService {
    static info(message, context) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
    }
    static error(message, error) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    }
    static warn(message, context) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context ? JSON.stringify(context) : '');
    }
}
