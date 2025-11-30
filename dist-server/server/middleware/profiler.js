
import { LoggerService } from '../services/logger-service';
export const profiler = (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e9 + diff[1]) / 1e6;
        // Log slow requests (> 500ms) or all requests in dev
        if (timeInMs > 500 || process.env.NODE_ENV !== 'production') {
            LoggerService.info(`⚡ [Profiler] ${req.method} ${req.originalUrl} - ${timeInMs.toFixed(2)}ms`);
        }
    });
    next();
};
