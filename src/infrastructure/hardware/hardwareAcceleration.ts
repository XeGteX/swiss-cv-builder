/**
 * Hardware Acceleration Detection Module
 * 
 * PR5: Detects if browser is using software rendering (no GPU acceleration)
 * and provides UI feedback to users.
 * 
 * Detection methods:
 * 1. WebGL context availability
 * 2. WEBGL_debug_renderer_info extension
 * 3. Known software renderer patterns
 */

export interface HardwareAccelerationResult {
    isHardwareAccelerated: boolean;
    isSoftwareRendering: boolean;
    renderer: string | null;
    vendor: string | null;
    reason: string;
}

// Known software renderer patterns (case-insensitive)
const SOFTWARE_RENDERER_PATTERNS = [
    'swiftshader',
    'llvmpipe',
    'software',
    'microsoft basic render',
    'angle (microsoft basic render',
    'mesa',
    'virtualbox',
    'vmware',
];

/**
 * Detect if the browser is using software rendering
 * Returns detailed information about the GPU/rendering status
 */
export function detectHardwareAcceleration(): HardwareAccelerationResult {
    // Create offscreen canvas for WebGL detection
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    // Try to get WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        return {
            isHardwareAccelerated: false,
            isSoftwareRendering: true,
            renderer: null,
            vendor: null,
            reason: 'WebGL not available',
        };
    }

    // Try to get debug info extension
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');

    if (!debugInfo) {
        // Can't determine renderer, assume hardware accelerated
        return {
            isHardwareAccelerated: true,
            isSoftwareRendering: false,
            renderer: 'Unknown (debug info blocked)',
            vendor: 'Unknown',
            reason: 'Unable to detect - assuming hardware accelerated',
        };
    }

    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';

    // Check for known software renderer patterns
    const lowerRenderer = renderer.toLowerCase();
    const isSoftware = SOFTWARE_RENDERER_PATTERNS.some(pattern =>
        lowerRenderer.includes(pattern)
    );

    return {
        isHardwareAccelerated: !isSoftware,
        isSoftwareRendering: isSoftware,
        renderer,
        vendor,
        reason: isSoftware
            ? `Software renderer detected: ${renderer}`
            : `Hardware accelerated: ${renderer}`,
    };
}

/**
 * Check localStorage for "don't show again" preference
 */
export function shouldShowHardwareWarning(): boolean {
    const dismissed = localStorage.getItem('nexal_hw_warning_dismissed');
    return dismissed !== 'true';
}

/**
 * Dismiss the hardware warning permanently
 */
export function dismissHardwareWarning(): void {
    localStorage.setItem('nexal_hw_warning_dismissed', 'true');
}

/**
 * Reset the hardware warning (for testing)
 */
export function resetHardwareWarning(): void {
    localStorage.removeItem('nexal_hw_warning_dismissed');
}

/**
 * Run a quick performance benchmark using requestAnimationFrame
 * Returns average FPS over 1 second
 */
export async function runPerformanceBenchmark(): Promise<number> {
    return new Promise((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        const duration = 1000; // 1 second

        function countFrame() {
            frameCount++;
            const elapsed = performance.now() - startTime;

            if (elapsed < duration) {
                requestAnimationFrame(countFrame);
            } else {
                const fps = (frameCount / elapsed) * 1000;
                resolve(Math.round(fps));
            }
        }

        requestAnimationFrame(countFrame);
    });
}

/**
 * Combined check: software rendering OR low FPS benchmark
 */
export async function checkPerformanceIssues(): Promise<{
    hasProblem: boolean;
    hwResult: HardwareAccelerationResult;
    fps?: number;
}> {
    const hwResult = detectHardwareAcceleration();

    // If software rendering detected, that's a problem
    if (hwResult.isSoftwareRendering) {
        return { hasProblem: true, hwResult };
    }

    // If can't determine, run benchmark as fallback
    if (!hwResult.renderer || hwResult.renderer.includes('Unknown')) {
        const fps = await runPerformanceBenchmark();
        // Low FPS threshold
        if (fps < 30) {
            return { hasProblem: true, hwResult, fps };
        }
    }

    return { hasProblem: false, hwResult };
}
