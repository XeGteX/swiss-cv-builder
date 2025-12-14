/**
 * HTML Report Generator
 * 
 * Generates a self-contained HTML report with thumbnails.
 */

import * as fs from 'fs';
import * as path from 'path';
import { DiffResult } from './diff';
import { PATHS } from './config';

export interface ReportCase {
    type: 'web' | 'pdf';
    preset: string;
    fixture: string;
    page: number;
    status: 'pass' | 'fail' | 'new';
    diffPercent: number;
    baselinePath: string;
    currentPath: string;
    diffPath: string;
}

/**
 * Convert image file to base64 data URL
 */
function imageToDataUrl(imagePath: string): string {
    if (!fs.existsSync(imagePath)) {
        return '';
    }
    const buffer = fs.readFileSync(imagePath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Generate HTML report
 */
export function generateReport(
    cases: ReportCase[],
    outputPath: string = PATHS.reportFile
): void {
    const passCount = cases.filter(c => c.status === 'pass').length;
    const failCount = cases.filter(c => c.status === 'fail').length;
    const newCount = cases.filter(c => c.status === 'new').length;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Regression Report</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a2e; 
            color: #eee; 
            margin: 0; 
            padding: 20px;
        }
        h1 { color: #fff; margin-bottom: 10px; }
        .summary { 
            display: flex; 
            gap: 20px; 
            margin-bottom: 30px;
            padding: 15px;
            background: #16213e;
            border-radius: 8px;
        }
        .stat { 
            padding: 10px 20px; 
            border-radius: 6px; 
            font-weight: bold;
        }
        .stat.pass { background: #10b981; }
        .stat.fail { background: #ef4444; }
        .stat.new { background: #f59e0b; }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(800px, 1fr)); 
            gap: 20px; 
        }
        .case { 
            background: #16213e; 
            border-radius: 8px; 
            padding: 15px; 
            border: 2px solid transparent;
        }
        .case.fail { border-color: #ef4444; }
        .case.new { border-color: #f59e0b; }
        .case-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 10px;
        }
        .case-title { font-weight: bold; font-size: 14px; }
        .case-status { 
            padding: 4px 10px; 
            border-radius: 4px; 
            font-size: 12px;
            font-weight: bold;
        }
        .case-status.pass { background: #10b981; }
        .case-status.fail { background: #ef4444; }
        .case-status.new { background: #f59e0b; }
        .images { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 10px; 
        }
        .image-box { text-align: center; }
        .image-box label { 
            display: block; 
            font-size: 11px; 
            color: #888; 
            margin-bottom: 5px; 
        }
        .image-box img { 
            max-width: 100%; 
            max-height: 300px; 
            border: 1px solid #333; 
            border-radius: 4px;
            background: #fff;
        }
        .diff-percent { 
            font-size: 12px; 
            color: #888; 
            margin-top: 10px; 
        }
        .no-image { 
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            background: #222;
            border-radius: 4px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>🎨 Visual Regression Report</h1>
    <p style="color:#888;">Generated: ${new Date().toISOString()}</p>
    
    <div class="summary">
        <div class="stat pass">✓ ${passCount} Passed</div>
        <div class="stat fail">✗ ${failCount} Failed</div>
        <div class="stat new">⚡ ${newCount} New</div>
    </div>

    <div class="grid">
        ${cases.map(c => `
        <div class="case ${c.status}">
            <div class="case-header">
                <span class="case-title">${c.type.toUpperCase()} / ${c.preset} / ${c.fixture} / Page ${c.page}</span>
                <span class="case-status ${c.status}">${c.status.toUpperCase()}</span>
            </div>
            <div class="images">
                <div class="image-box">
                    <label>Baseline</label>
                    ${c.baselinePath && fs.existsSync(c.baselinePath)
            ? `<img src="${imageToDataUrl(c.baselinePath)}" alt="Baseline" />`
            : `<div class="no-image">No baseline</div>`}
                </div>
                <div class="image-box">
                    <label>Current</label>
                    ${c.currentPath && fs.existsSync(c.currentPath)
            ? `<img src="${imageToDataUrl(c.currentPath)}" alt="Current" />`
            : `<div class="no-image">No current</div>`}
                </div>
                <div class="image-box">
                    <label>Diff</label>
                    ${c.diffPath && fs.existsSync(c.diffPath)
            ? `<img src="${imageToDataUrl(c.diffPath)}" alt="Diff" />`
            : `<div class="no-image">No diff</div>`}
                </div>
            </div>
            <div class="diff-percent">Diff: ${c.diffPercent.toFixed(2)}%</div>
        </div>
        `).join('')}
    </div>
</body>
</html>`;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html);
    console.log(`Report saved to: ${outputPath}`);
}

/**
 * Convert DiffResult to ReportCase
 */
export function diffResultToCase(
    result: DiffResult,
    type: 'web' | 'pdf'
): ReportCase {
    // Parse preset/fixture/page from path
    const pathParts = result.current.split(/[\/\\]/);
    const page = parseInt(pathParts.pop()?.match(/page-(\d+)/)?.[1] || '1', 10);
    const fixture = pathParts.pop() || 'unknown';
    const preset = pathParts.pop() || 'unknown';

    const hasBaseline = fs.existsSync(result.baseline);

    return {
        type,
        preset,
        fixture,
        page,
        status: !hasBaseline ? 'new' : result.match ? 'pass' : 'fail',
        diffPercent: result.diffPercent,
        baselinePath: result.baseline,
        currentPath: result.current,
        diffPath: result.diffPath,
    };
}
