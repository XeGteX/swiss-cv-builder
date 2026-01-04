/**
 * NEXAL2 - Performance React Hooks
 * 
 * React hooks for debounce/throttle with fnRef pattern
 * to avoid stale closure bugs.
 */

import { useCallback, useRef, useEffect } from 'react';
import { debounce, throttle, type ThrottleOptions } from './utils';

// ============================================================================
// USE THROTTLED CALLBACK
// ============================================================================

/**
 * React hook for throttled callbacks.
 * Uses fnRef pattern to always call latest function version.
 * Automatically cleans up on unmount.
 * 
 * @param fn - Function to throttle (can change without resetting throttle)
 * @param wait - Throttle interval in ms
 * @param options - Throttle options (leading, trailing)
 */
export function useThrottledCallback<T extends (...args: any[]) => void>(
    fn: T,
    wait: number,
    options?: ThrottleOptions
): T {
    // fnRef always holds latest fn - avoids stale closure
    const fnRef = useRef(fn);
    fnRef.current = fn;

    // Throttled wrapper that calls fnRef.current
    const throttledRef = useRef<ReturnType<typeof throttle<T>> | null>(null);

    // Create throttled function once, or when wait/options change
    useEffect(() => {
        throttledRef.current = throttle(
            ((...args: Parameters<T>) => fnRef.current(...args)) as T,
            wait,
            options
        );
        return () => {
            throttledRef.current?.cancel();
        };
    }, [wait, options?.leading, options?.trailing]);

    // Return stable callback
    return useCallback((...args: Parameters<T>) => {
        throttledRef.current?.(...args);
    }, []) as T;
}

// ============================================================================
// USE DEBOUNCED CALLBACK
// ============================================================================

/**
 * React hook for debounced callbacks.
 * Uses fnRef pattern to always call latest function version.
 * Automatically cleans up on unmount.
 * 
 * @param fn - Function to debounce (can change without resetting debounce)
 * @param wait - Debounce delay in ms
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
    fn: T,
    wait: number
): T & { flush: () => void } {
    // fnRef always holds latest fn - avoids stale closure
    const fnRef = useRef(fn);
    fnRef.current = fn;

    // Debounced wrapper that calls fnRef.current
    const debouncedRef = useRef<ReturnType<typeof debounce<T>> | null>(null);

    // Create debounced function once, or when wait changes
    useEffect(() => {
        debouncedRef.current = debounce(
            ((...args: Parameters<T>) => fnRef.current(...args)) as T,
            wait
        );
        return () => {
            debouncedRef.current?.cancel();
        };
    }, [wait]);

    // Return stable callback with flush
    const callback = useCallback((...args: Parameters<T>) => {
        debouncedRef.current?.(...args);
    }, []) as T & { flush: () => void };

    // Attach flush method
    (callback as any).flush = () => {
        debouncedRef.current?.flush();
    };

    return callback;
}

// ============================================================================
// USE DEBOUNCED VALUE
// ============================================================================

import { useState } from 'react';

/**
 * React hook that debounces a value.
 * Useful for search inputs, sliders, etc.
 * 
 * @param value - Value to debounce
 * @param delay - Debounce delay in ms
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
