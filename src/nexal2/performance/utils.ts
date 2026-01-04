/**
 * NEXAL2 - Debounce/Throttle Pure Utilities
 * 
 * Pure functions with no React dependencies.
 * For React hooks, see ./hooks.ts
 */

// ============================================================================
// DEBOUNCE
// ============================================================================

/**
 * Creates a debounced version of a function.
 * The function will only be called after `wait` ms have passed since the last call.
 */
export function debounce<T extends (...args: any[]) => void>(
    fn: T,
    wait: number
): T & { cancel: () => void; flush: () => void } {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastArgs: Parameters<T> | null = null;

    const debounced = ((...args: Parameters<T>) => {
        lastArgs = args;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            if (lastArgs) {
                fn(...lastArgs);
                lastArgs = null;
            }
            timeoutId = null;
        }, wait);
    }) as T & { cancel: () => void; flush: () => void };

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastArgs = null;
    };

    debounced.flush = () => {
        if (timeoutId && lastArgs) {
            clearTimeout(timeoutId);
            fn(...lastArgs);
            lastArgs = null;
            timeoutId = null;
        }
    };

    return debounced;
}

// ============================================================================
// THROTTLE
// ============================================================================

export interface ThrottleOptions {
    /** Execute on the leading edge (default: true) */
    leading?: boolean;
    /** Execute on the trailing edge (default: true) */
    trailing?: boolean;
}

/**
 * Creates a throttled version of a function.
 * The function will be called at most once per `wait` ms.
 */
export function throttle<T extends (...args: any[]) => void>(
    fn: T,
    wait: number,
    options: ThrottleOptions = {}
): T & { cancel: () => void } {
    const { leading = true, trailing = true } = options;

    let lastArgs: Parameters<T> | null = null;
    let lastCallTime = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const throttled = ((...args: Parameters<T>) => {
        const now = Date.now();
        const elapsed = now - lastCallTime;

        // First call or enough time passed
        if (!lastCallTime || elapsed >= wait) {
            if (leading) {
                fn(...args);
                lastCallTime = now;
                lastArgs = null;
            } else {
                lastArgs = args;
            }
        } else {
            // Within throttle window
            lastArgs = args;
        }

        // Schedule trailing call if needed
        if (trailing && lastArgs && !timeoutId) {
            const remaining = wait - elapsed;
            timeoutId = setTimeout(() => {
                if (lastArgs) {
                    fn(...lastArgs);
                    lastCallTime = Date.now();
                    lastArgs = null;
                }
                timeoutId = null;
            }, Math.max(0, remaining));
        }
    }) as T & { cancel: () => void };

    throttled.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastArgs = null;
        lastCallTime = 0;
    };

    return throttled;
}
