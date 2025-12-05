/**
 * MISSION 3 R&D: Color Extractor Service
 * 
 * Smart Color Picker - Extract dominant palette from images
 * This is a utility service for the "Caméléon" feature.
 * 
 * Current implementation: Canvas-based color extraction
 * Future: Could integrate with Gemini Vision API for smarter extraction
 */

export interface ColorPalette {
    dominant: string;
    vibrant: string;
    muted: string;
    accent: string;
    background: string;
    text: string;
}

export interface ColorExtractionResult {
    palette: ColorPalette;
    rawColors: string[];
    timestamp: number;
}

/**
 * Extract dominant colors from an image URL
 */
export async function extractColorsFromImage(imageUrl: string): Promise<ColorExtractionResult> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    throw new Error('Could not get canvas context');
                }

                // Resize for performance (sample at 50x50)
                const sampleSize = 50;
                canvas.width = sampleSize;
                canvas.height = sampleSize;

                ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
                const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
                const pixels = imageData.data;

                // Color frequency map
                const colorMap = new Map<string, number>();

                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];

                    // Skip transparent pixels
                    if (a < 128) continue;

                    // Quantize to reduce color count (8 levels per channel)
                    const qr = Math.floor(r / 32) * 32;
                    const qg = Math.floor(g / 32) * 32;
                    const qb = Math.floor(b / 32) * 32;

                    const key = `${qr},${qg},${qb}`;
                    colorMap.set(key, (colorMap.get(key) || 0) + 1);
                }

                // Sort by frequency
                const sortedColors = Array.from(colorMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([color]) => {
                        const [r, g, b] = color.split(',').map(Number);
                        return rgbToHex(r, g, b);
                    });

                // Build palette
                const palette = buildPalette(sortedColors);

                resolve({
                    palette,
                    rawColors: sortedColors,
                    timestamp: Date.now()
                });
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => {
            reject(new Error(`Failed to load image: ${imageUrl}`));
        };

        img.src = imageUrl;
    });
}

/**
 * Build a usable palette from raw extracted colors
 */
function buildPalette(colors: string[]): ColorPalette {
    if (colors.length === 0) {
        // Default fallback palette
        return {
            dominant: '#8b5cf6',
            vibrant: '#a855f7',
            muted: '#6b7280',
            accent: '#3b82f6',
            background: '#0f172a',
            text: '#f8fafc'
        };
    }

    const dominant = colors[0];
    const vibrant = findMostVibrant(colors) || colors[0];
    const muted = findMostMuted(colors) || '#6b7280';

    return {
        dominant,
        vibrant,
        muted,
        accent: vibrant,
        background: adjustBrightness(dominant, -0.7),
        text: isLightColor(dominant) ? '#0f172a' : '#f8fafc'
    };
}

/**
 * Find the most vibrant (saturated) color
 */
function findMostVibrant(colors: string[]): string | null {
    let maxSaturation = 0;
    let vibrant: string | null = null;

    for (const color of colors) {
        const { s } = hexToHsl(color);
        if (s > maxSaturation) {
            maxSaturation = s;
            vibrant = color;
        }
    }

    return vibrant;
}

/**
 * Find the most muted (desaturated) color
 */
function findMostMuted(colors: string[]): string | null {
    let minSaturation = 100;
    let muted: string | null = null;

    for (const color of colors) {
        const { s, l } = hexToHsl(color);
        // Avoid pure black/white
        if (l > 10 && l < 90 && s < minSaturation) {
            minSaturation = s;
            muted = color;
        }
    }

    return muted;
}

/**
 * Check if a color is light
 */
function isLightColor(hex: string): boolean {
    const { l } = hexToHsl(hex);
    return l > 50;
}

/**
 * Adjust brightness of a color
 */
function adjustBrightness(hex: string, factor: number): string {
    const { h, s, l } = hexToHsl(hex);
    const newL = Math.max(0, Math.min(100, l + factor * 100));
    return hslToHex(h, s, newL);
}

// ============ Color Conversion Utilities ============

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break;
            case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break;
            case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Export singleton instance for convenience
export const colorExtractor = {
    extractFromImage: extractColorsFromImage,
    isLightColor,
    adjustBrightness,
    hexToHsl,
    hslToHex
};

export default colorExtractor;
