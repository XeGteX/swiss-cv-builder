/**
 * NEXAL2 - Layout Cache (Production-grade)
 * 
 * LRU cache for computed layouts with O(1) operations.
 * Cache key = hash(all pages + design + constraints)
 * 
 * Fixes applied:
 * - Hash ALL pages, not just first
 * - Stable JSON stringify (sorted keys)
 * - LRU O(1) via Map (delete+set on hit)
 * - DEV-only logging
 * - Immutability enforced (Object.freeze in DEV)
 */

import type { LayoutTree, LayoutConstraints, SceneDocument } from '../types';

// ============================================================================
// DEBUG FLAG (SSR-safe)
// ============================================================================

let _debugCached: boolean | null = null;
function DEBUG(): boolean {
    if (_debugCached !== null) return _debugCached;
    if (!import.meta.env.DEV) {
        _debugCached = false;
        return false;
    }
    if (import.meta.env.VITE_NEXAL_DEBUG === 'true') {
        _debugCached = true;
        return true;
    }
    // SSR-safe: check window/localStorage exist
    if (typeof window !== 'undefined' && window.localStorage) {
        _debugCached = localStorage.getItem('nexal_debug_cache') === 'true';
        return _debugCached;
    }
    _debugCached = false;
    return false;
}

// ============================================================================
// STABLE STRINGIFY (sorted keys for deterministic output)
// ============================================================================

/**
 * Stable JSON stringify with sorted keys.
 * Ensures same object = same string regardless of key insertion order.
 */
function stableStringify(obj: unknown): string {
    if (obj === null || obj === undefined) return '';
    if (typeof obj !== 'object') return String(obj);
    if (Array.isArray(obj)) {
        return '[' + obj.map(stableStringify).join(',') + ']';
    }
    const sorted = Object.keys(obj as object).sort();
    return '{' + sorted.map(k => `"${k}":${stableStringify((obj as any)[k])}`).join(',') + '}';
}

// ============================================================================
// HASH FUNCTION
// ============================================================================

/**
 * Fast string hash (djb2 algorithm)
 */
function hashString(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return hash >>> 0;
}

/**
 * Create a cache key from scene and constraints.
 * Hashes ALL pages for full content coverage.
 */
export function createLayoutCacheKey(
    scene: SceneDocument,
    constraints: LayoutConstraints
): string {
    // Hash ALL pages (not just first)
    const pagesHash = hashString(stableStringify(scene.pages));

    // Scene metadata
    const scenePart = {
        pagesHash,
        format: scene.paperFormat,
    };

    // Extract relevant constraint parts (stable stringify handles key order)
    const constraintsPart = {
        sidebarWidth: constraints.sidebarWidth,
        sidebarPosition: constraints.sidebarPosition,
        margins: constraints.margins,
        fontScale: constraints.fontScale,
        frames: (constraints as any).frames,
        paper: (constraints as any).paper,
        tokens: (constraints as any).tokens,
    };

    const sceneHash = hashString(stableStringify(scenePart));
    const constraintsHash = hashString(stableStringify(constraintsPart));

    return `nx2:${sceneHash}:${constraintsHash}`;
}

// ============================================================================
// LRU CACHE (O(1) via Map ordering)
// ============================================================================

const MAX_CACHE_SIZE = 10;
const layoutCache = new Map<string, LayoutTree>();
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get cached layout or null if not found.
 * O(1) - Updates LRU position by delete+set.
 */
export function getCachedLayout(key: string): LayoutTree | null {
    const layout = layoutCache.get(key);
    if (layout) {
        // LRU: Move to end (most recently used)
        layoutCache.delete(key);
        layoutCache.set(key, layout);
        cacheHits++;
        if (DEBUG()) {
            console.log(`[NEXAL2 Cache] HIT: ${key.slice(0, 25)}... (${cacheHits}/${cacheHits + cacheMisses})`);
        }
        return layout;
    }
    cacheMisses++;
    return null;
}

/**
 * Store layout in cache.
 * O(1) - Evicts oldest (first key) if at capacity.
 * Freezes layout in DEV to enforce immutability.
 */
export function setCachedLayout(key: string, layout: LayoutTree): void {
    // Evict oldest if at capacity (first key in Map = LRU)
    if (layoutCache.size >= MAX_CACHE_SIZE) {
        const oldestKey = layoutCache.keys().next().value;
        if (oldestKey) {
            layoutCache.delete(oldestKey);
            if (DEBUG()) {
                console.log(`[NEXAL2 Cache] Evicted: ${oldestKey.slice(0, 25)}...`);
            }
        }
    }

    // Freeze layout in DEV to catch mutation bugs
    const storedLayout = import.meta.env.DEV ? deepFreeze(layout) : layout;

    layoutCache.set(key, storedLayout);
    if (DEBUG()) {
        console.log(`[NEXAL2 Cache] SET: ${key.slice(0, 25)}... (size: ${layoutCache.size})`);
    }
}

/**
 * Deep freeze an object (DEV only, for mutation detection)
 */
function deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    Object.freeze(obj);
    for (const key of Object.keys(obj)) {
        deepFreeze((obj as any)[key]);
    }
    return obj;
}

/**
 * Clear the entire cache
 */
export function clearLayoutCache(): void {
    layoutCache.clear();
    cacheHits = 0;
    cacheMisses = 0;
    if (DEBUG()) {
        console.log('[NEXAL2 Cache] Cleared');
    }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { hits: number; misses: number; size: number; hitRate: string } {
    const total = cacheHits + cacheMisses;
    return {
        hits: cacheHits,
        misses: cacheMisses,
        size: layoutCache.size,
        hitRate: total > 0 ? `${((cacheHits / total) * 100).toFixed(1)}%` : 'N/A',
    };
}
