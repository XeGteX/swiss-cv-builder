/**
 * NEXAL2 - Performance Module
 * 
 * Re-exports pure utilities and React hooks.
 */

// Pure utilities (no React)
export { debounce, throttle, type ThrottleOptions } from './utils';

// React hooks
export {
    useThrottledCallback,
    useDebouncedCallback,
    useDebouncedValue,
} from './hooks';
