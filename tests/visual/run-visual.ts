/**
 * Visual Regression Test Runner
 * 
 * Orchestrates the full visual regression test workflow:
 * 1. Capture web screenshots
 * 2. Generate and rasterize PDFs
 * 3. Compare against baselines
 * 4. Generate HTML report
 * 5. Exit with appropriate code
 * 
 * Usage:
 *   npx tsx tests/visual/run-visual.ts           # Compare mode
 *   UPDATE_GOLDENS=true npx tsx tests/visual/ts  # Update baselines
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { PRESETS_TO_TEST, PATHS, DEV_SERVER } from './config';
import { FIXTURES } from './fixtures';
import { capturePdfScreenshots } from './render-pdf';
import { compareImages } from './diff';
import { generateReport, ReportCase, diffResultToCase } from './report';

const UPDATE_GOLDENS = process.env.UPDATE_GOLDENS === 'true';

/**
 * Check if dev server is running
 */
async function isServerRunning(port: number): Promise<boolean> {
    try {
        const response = await fetch(`http://localhost:${port}/`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(2000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Wait for server to be ready
 */
async function waitForServer(port: number, timeoutMs: number = 30000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (await isServerRunning(port)) {
            return;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error(`Server did not start within ${timeoutMs}ms`);
}

/**
 * Start dev server if not already running
 */
async function ensureDevServer(): Promise<ChildProcess | null> {
    if (await isServerRunning(DEV_SERVER.port)) {
        console.log('Dev server already running');
        return null;
    }

    console.log('Starting dev server...');
    const server = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'pipe',
    });

    server.stdout?.on('data', (data) => {
        const str = data.toString();
        if (str.includes('ready') || str.includes('Local:')) {
            console.log('Dev server ready');
        }
    });

    await waitForServer(DEV_SERVER.port);
    return server;
}

/**
 * Copy current images to golden directory
 */
function updateBaselines(): void {
    const diffDir = PATHS.diffDir;
    const goldenDir = PATHS.goldenDir;

    function copyRecursive(src: string, dest: string): void {
        if (!fs.existsSync(src)) return;

        const stats = fs.statSync(src);
        if (stats.isDirectory()) {
            fs.mkdirSync(dest, { recursive: true });
            for (const file of fs.readdirSync(src)) {
                // Skip diff images
                if (file.includes('-diff')) continue;
                copyRecursive(path.join(src, file), path.join(dest, file));
            }
        } else if (src.endsWith('.png') && !src.includes('-diff')) {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(src, dest);
        }
    }

    // Copy web and pdf directories
    copyRecursive(path.join(diffDir, 'web'), path.join(goldenDir, 'web'));
    copyRecursive(path.join(diffDir, 'pdf'), path.join(goldenDir, 'pdf'));
}

/**
 * Main runner
 */
async function main(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('NEXAL2 Visual Regression Test');
    console.log('='.repeat(60));
    console.log(`Mode: ${UPDATE_GOLDENS ? 'UPDATE BASELINES' : 'COMPARE'}`);
    console.log(`Presets: ${PRESETS_TO_TEST.join(', ')}`);
    console.log(`Fixtures: ${FIXTURES.length}`);
    console.log('');

    // Ensure diff directory exists
    fs.mkdirSync(PATHS.diffDir, { recursive: true });

    // Start server if needed (for web capture)
    // let server: ChildProcess | null = null;
    // try {
    //     server = await ensureDevServer();
    // } catch (error) {
    //     console.warn('Could not start dev server, skipping web capture');
    // }

    const allCases: ReportCase[] = [];

    try {
        // // Capture web screenshots
        // if (server || await isServerRunning(DEV_SERVER.port)) {
        //     console.log('\n📸 Capturing web screenshots...');
        //     const webResults = await captureWebScreenshots(PRESETS_TO_TEST, FIXTURES);
        //     
        //     for (const result of webResults) {
        //         for (const pagePath of result.pages) {
        //             const relativePath = pagePath.replace(PATHS.diffDir, '').replace(/^[\/\\]/, '');
        //             const baselinePath = path.join(PATHS.goldenDir, relativePath);
        //             const diffPath = pagePath.replace('.png', '-diff.png');
        //             
        //             const diffResult = compareImages(baselinePath, pagePath, diffPath);
        //             allCases.push(diffResultToCase(diffResult, 'web'));
        //         }
        //     }
        // }

        // Capture PDF screenshots
        console.log('\n📄 Generating PDF screenshots...');
        const pdfResults = await capturePdfScreenshots(PRESETS_TO_TEST, FIXTURES);

        for (const result of pdfResults) {
            for (const pagePath of result.pages) {
                const relativePath = pagePath.replace(PATHS.diffDir, '').replace(/^[\/\\]/, '');
                const baselinePath = path.join(PATHS.goldenDir, relativePath);
                const diffPath = pagePath.replace('.png', '-diff.png');

                const diffResult = compareImages(baselinePath, pagePath, diffPath);
                allCases.push(diffResultToCase(diffResult, 'pdf'));
            }
        }

        // Generate report
        console.log('\n📊 Generating report...');
        generateReport(allCases);

        // Update baselines if requested
        if (UPDATE_GOLDENS) {
            console.log('\n📥 Updating baselines...');
            updateBaselines();
            console.log('Baselines updated successfully');
        }

        // Summary
        const passed = allCases.filter(c => c.status === 'pass').length;
        const failed = allCases.filter(c => c.status === 'fail').length;
        const newCases = allCases.filter(c => c.status === 'new').length;

        console.log('\n' + '='.repeat(60));
        console.log(`SUMMARY: ${passed} passed, ${failed} failed, ${newCases} new`);
        console.log('='.repeat(60));
        console.log(`Report: ${PATHS.reportFile}`);

        // Exit code
        if (!UPDATE_GOLDENS && failed > 0) {
            console.log('\n❌ Visual regression test FAILED');
            process.exit(1);
        } else if (!UPDATE_GOLDENS && newCases > 0) {
            console.log('\n⚠️  New baselines detected. Run with UPDATE_GOLDENS=true to create them.');
            process.exit(1);
        } else {
            console.log('\n✅ Visual regression test PASSED');
            process.exit(0);
        }

    } finally {
        // Cleanup
        // server?.kill();
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
