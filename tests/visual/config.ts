/**
 * Visual Regression Test Configuration
 */

import type { PresetId } from '../../src/nexal2/constraints/presets';

// Presets to test
export const PRESETS_TO_TEST: PresetId[] = ['ATS_ONE_COLUMN', 'SIDEBAR'];

// Viewport configurations (A4 at 96dpi = 794x1122)
export const VIEWPORTS = {
    A4: { width: 794, height: 1123 },
    LETTER: { width: 816, height: 1056 },
};

// Default viewport
export const DEFAULT_VIEWPORT = VIEWPORTS.A4;

// Diff configuration
export const DIFF_CONFIG = {
    threshold: 0.1,         // Pixel color threshold (0-1)
    maxDiffPercent: 0.5,    // Max % of pixels that can differ before failure
    includeAA: false,       // Include anti-aliased pixels
};

// Paths
export const PATHS = {
    goldenDir: 'tests/__golden__',
    diffDir: 'tests/__diff__',
    reportFile: 'tests/__diff__/report.html',
};

// Dev server config
export const DEV_SERVER = {
    port: 5173,
    host: 'localhost',
    startupTimeoutMs: 30000,
};

// Fixed date for determinism
export const FROZEN_TIME = new Date('2024-01-15T10:00:00.000Z').getTime();
