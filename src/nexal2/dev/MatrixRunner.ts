/**
 * NEXAL2 - Dev Matrix Runner
 * 
 * Automated testing of all region/preset/option combinations.
 * Runs validateLayout on each combination and reports results.
 * 
 * Phase 4.3: Regression harness.
 */

import { getRegionIds, type RegionId } from '../constraints/regions';
import { getPresetIds, type PresetId } from '../constraints/presets';
import { createConstraints, type ChameleonConstraints } from '../constraints/createConstraints';
import { buildScene } from '../scenegraph';
import { computeLayout } from '../layout';
import { validateLayout, formatValidationResult, type ValidationResult } from './LayoutValidator';

// ============================================================================
// TYPES
// ============================================================================

export interface MatrixCase {
    regionId: RegionId;
    presetId: PresetId;
    sidebarPosition: 'left' | 'right' | undefined;
}

export interface MatrixResult {
    case: MatrixCase;
    constraints: ChameleonConstraints;
    validation: ValidationResult;
    signature: string;
}

export interface MatrixSummary {
    total: number;
    passed: number;
    failed: number;
    results: MatrixResult[];
    duration: number;
}

// ============================================================================
// MOCK PROFILE (minimal valid profile for testing)
// ============================================================================

const MOCK_PROFILE = {
    id: 'test-profile',
    personal: {
        firstName: 'Test',
        lastName: 'User',
        title: 'Software Engineer',
        contact: {
            email: 'test@example.com',
            phone: '+1234567890',
        },
        address: 'Test City',
    },
    experiences: [
        {
            company: 'Test Company',
            role: 'Developer',
            startDate: '2020-01',
            endDate: '2023-12',
            tasks: ['Built features', 'Fixed bugs'],
        }
    ],
    educations: [
        {
            school: 'Test University',
            degree: 'Computer Science',
            year: '2020',
        }
    ],
    skills: ['JavaScript', 'TypeScript', 'React'],
    languages: [
        { name: 'English', level: 'Native' },
        { name: 'French', level: 'Fluent' },
    ],
};

// ============================================================================
// MATRIX GENERATION
// ============================================================================

/**
 * Generate all test cases for the validation matrix.
 */
export function generateMatrixCases(): MatrixCase[] {
    const regions = getRegionIds();
    const presets = getPresetIds();
    const cases: MatrixCase[] = [];

    for (const regionId of regions) {
        for (const presetId of presets) {
            if (presetId === 'SIDEBAR') {
                // SIDEBAR preset tests both left and right positions
                cases.push({ regionId, presetId, sidebarPosition: 'left' });
                cases.push({ regionId, presetId, sidebarPosition: 'right' });
            } else {
                // Other presets don't use sidebarPosition
                cases.push({ regionId, presetId, sidebarPosition: undefined });
            }
        }
    }

    return cases;
}

// ============================================================================
// ENHANCED SIGNATURE
// ============================================================================

/**
 * Compute an enhanced layout signature that includes all layout-relevant inputs.
 */
export function computeEnhancedSignature(
    constraints: ChameleonConstraints,
    _layout: { pages: Array<{ frame: { width: number; height: number } }> }
): string {
    const parts: (string | number)[] = [
        constraints.presetId,
        constraints.regionId,
        constraints.paperFormat,
        constraints.density,
        constraints.sidebarPosition,
        Math.round(constraints.paper.width),
        Math.round(constraints.paper.height),
        constraints.tokens.fontSize.body,
        constraints.tokens.lineHeight,
    ];

    // Add frame info as strings
    if (constraints.frames.sidebar) {
        parts.push(`sb:${Math.round(constraints.frames.sidebar.x)}:${Math.round(constraints.frames.sidebar.width)}`);
    }
    if (constraints.frames.main) {
        parts.push(`m:${Math.round(constraints.frames.main.x)}:${Math.round(constraints.frames.main.width)}`);
    }

    const json = parts.join('|');
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
        const char = json.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

// ============================================================================
// MATRIX RUNNER
// ============================================================================

/**
 * Run the full validation matrix.
 */
export function runValidationMatrix(
    profile: any = MOCK_PROFILE,
    design: any = {}
): MatrixSummary {
    const startTime = performance.now();
    const cases = generateMatrixCases();
    const results: MatrixResult[] = [];

    let passed = 0;
    let failed = 0;

    for (const testCase of cases) {
        // Create constraints
        const constraints = createConstraints({
            regionId: testCase.regionId,
            presetId: testCase.presetId,
            sidebarPosition: testCase.sidebarPosition,
        });

        // Sync design with constraints
        const syncedDesign = {
            ...design,
            paperFormat: constraints.paperFormat,
            showPhoto: constraints.supportsPhoto && (design.showPhoto ?? true),
            sidebarPosition: testCase.sidebarPosition ?? 'left',
            accentColor: design.accentColor || '#2563EB',
        };

        // Build scene and compute layout
        const scene = buildScene(profile, syncedDesign);
        const layout = computeLayout(scene, constraints as any);

        // Validate
        const validation = validateLayout(layout, constraints as any);

        // Compute signature
        const signature = computeEnhancedSignature(constraints, layout);

        results.push({
            case: testCase,
            constraints,
            validation,
            signature,
        });

        if (validation.valid) {
            passed++;
        } else {
            failed++;
        }
    }

    const duration = performance.now() - startTime;

    return {
        total: cases.length,
        passed,
        failed,
        results,
        duration,
    };
}

/**
 * Format matrix summary for console output.
 */
export function formatMatrixSummary(summary: MatrixSummary): string {
    const lines: string[] = [];

    lines.push(`\n${'='.repeat(60)}`);
    lines.push(`NEXAL2 Layout Validation Matrix`);
    lines.push(`${'='.repeat(60)}`);
    lines.push(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed}`);
    lines.push(`Duration: ${summary.duration.toFixed(0)}ms`);
    lines.push(`${'='.repeat(60)}\n`);

    // Group by status
    const failures = summary.results.filter(r => !r.validation.valid);
    const passes = summary.results.filter(r => r.validation.valid);

    if (failures.length > 0) {
        lines.push(`\n❌ FAILURES (${failures.length}):\n`);
        for (const result of failures) {
            const c = result.case;
            const pos = c.sidebarPosition ? `/${c.sidebarPosition}` : '';
            lines.push(`  ${c.regionId}/${c.presetId}${pos}:`);
            lines.push(`    ${formatValidationResult(result.validation).replace(/\n/g, '\n    ')}`);
        }
    }

    if (passes.length > 0 && failures.length > 0) {
        lines.push(`\n✅ PASSES (${passes.length}):\n`);
        const passNames = passes.map(r => {
            const c = r.case;
            const pos = c.sidebarPosition ? `/${c.sidebarPosition}` : '';
            return `${c.regionId}/${c.presetId}${pos}`;
        });
        lines.push(`  ${passNames.join(', ')}`);
    }

    if (summary.failed === 0) {
        lines.push(`\n🎉 ALL TESTS PASSED!\n`);
    }

    return lines.join('\n');
}

/**
 * Run matrix and log results to console.
 */
export function runAndLogMatrix(profile?: any, design?: any): MatrixSummary {
    console.log('[NEXAL2] Running validation matrix...');
    const summary = runValidationMatrix(profile, design);
    console.log(formatMatrixSummary(summary));
    return summary;
}

export default runValidationMatrix;
