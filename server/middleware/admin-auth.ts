/**
 * Admin Middleware
 * 
 * Protects admin routes - requires authenticated admin user.
 */

import type { Request, Response, NextFunction } from 'express';

// Track if bypass warning was logged (once per startup)
let bypassWarningLogged = false;

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    // DEV BYPASS: Only in development AND with explicit flag
    // This prevents accidental bypass in prod-like environments
    const isDevBypassEnabled =
        process.env.NODE_ENV === 'development' &&
        process.env.ALLOW_DEV_ADMIN_BYPASS === 'true';

    if (isDevBypassEnabled) {
        if (!bypassWarningLogged) {
            console.warn('[Admin Auth] ⚠️ DEV BYPASS ACTIVE - not for production!');
            bypassWarningLogged = true;
        }
        return next();
    }

    // Check if user is authenticated and is admin
    const user = (req as any).user;
    if (!user) {
        return res.status(401).json({
            error: 'Authentication required'
        });
    }

    if (!user.isAdmin) {
        return res.status(403).json({
            error: 'Admin access required'
        });
    }

    next();
};

/**
 * Simple in-memory rate limiting for admin endpoints
 * Limit: 30 requests per minute per IP
 */
const rateLimitWindow = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 30;
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequestCounts.entries()) {
        if (now - data.windowStart > rateLimitWindow * 2) {
            ipRequestCounts.delete(ip);
        }
    }
}, 5 * 60 * 1000);

export const adminRateLimit = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = ipRequestCounts.get(ip);

    // Reset window if expired
    if (!record || now - record.windowStart > rateLimitWindow) {
        record = { count: 0, windowStart: now };
    }

    record.count++;
    ipRequestCounts.set(ip, record);

    // Check limit
    if (record.count > maxRequestsPerWindow) {
        console.warn(`[Admin Auth] Rate limit exceeded for IP: ${ip}`);
        return res.status(429).json({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((record.windowStart + rateLimitWindow - now) / 1000),
        });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequestsPerWindow);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequestsPerWindow - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((record.windowStart + rateLimitWindow) / 1000));

    next();
};
