/**
 * Pixel Diff Comparison
 * 
 * Compares current screenshots against golden baselines using pixelmatch.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { DIFF_CONFIG, PATHS } from './config';

export interface DiffResult {
    baseline: string;
    current: string;
    diffPath: string;
    match: boolean;
    diffPercent: number;
    diffPixels: number;
    totalPixels: number;
}

/**
 * Compare two PNG images and generate diff
 */
export function compareImages(
    baselinePath: string,
    currentPath: string,
    diffOutputPath: string
): DiffResult {
    // Read images
    if (!fs.existsSync(baselinePath)) {
        return {
            baseline: baselinePath,
            current: currentPath,
            diffPath: diffOutputPath,
            match: false,
            diffPercent: 100,
            diffPixels: 0,
            totalPixels: 0,
        };
    }

    if (!fs.existsSync(currentPath)) {
        return {
            baseline: baselinePath,
            current: currentPath,
            diffPath: diffOutputPath,
            match: false,
            diffPercent: 100,
            diffPixels: 0,
            totalPixels: 0,
        };
    }

    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    const currentImg = PNG.sync.read(fs.readFileSync(currentPath));

    const { width, height } = baselineImg;

    // Size mismatch
    if (currentImg.width !== width || currentImg.height !== height) {
        return {
            baseline: baselinePath,
            current: currentPath,
            diffPath: diffOutputPath,
            match: false,
            diffPercent: 100,
            diffPixels: width * height,
            totalPixels: width * height,
        };
    }

    const diff = new PNG({ width, height });

    const diffPixels = pixelmatch(
        baselineImg.data,
        currentImg.data,
        diff.data,
        width,
        height,
        {
            threshold: DIFF_CONFIG.threshold,
            includeAA: DIFF_CONFIG.includeAA,
        }
    );

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(diffOutputPath), { recursive: true });
    fs.writeFileSync(diffOutputPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const diffPercent = (diffPixels / totalPixels) * 100;
    const match = diffPercent <= DIFF_CONFIG.maxDiffPercent;

    return {
        baseline: baselinePath,
        current: currentPath,
        diffPath: diffOutputPath,
        match,
        diffPercent,
        diffPixels,
        totalPixels,
    };
}

/**
 * Compare all captured images against baselines
 */
export function compareAllImages(
    type: 'web' | 'pdf',
    capturedPaths: string[],
    goldenDir: string = PATHS.goldenDir,
    diffDir: string = PATHS.diffDir
): DiffResult[] {
    const results: DiffResult[] = [];

    for (const currentPath of capturedPaths) {
        // Derive baseline path from current path
        const relativePath = currentPath.replace(diffDir, '').replace(/^[\/\\]/, '');
        const baselinePath = path.join(goldenDir, relativePath);
        const diffPath = currentPath.replace('.png', '-diff.png');

        const result = compareImages(baselinePath, currentPath, diffPath);
        results.push(result);
    }

    return results;
}
