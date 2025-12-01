/**
 * 🛡️ AEGIS SENTINEL - Main Guardian Script
 * 
 * Orchestrates all validation checks and reports system health.
 * 
 * Usage: npm run sentinel
 * 
 * Exit codes:
 * - 0: All checks passed (HEALTHY)
 * - 1: One or more checks failed (BROKEN)
 */

import * as fs from 'fs';
import * as path from 'path';
import { scanImports, type ScanResult } from './utils/import-scanner';
import { runTypeCheck, type TypeCheckResult } from './utils/type-checker';
import { detectCircularDependencies, type DepGraphResult } from './utils/dep-graph';

// ============================================================================
// TYPES
// ============================================================================

type SystemStatus = 'HEALTHY' | 'DEGRADED' | 'BROKEN';

interface SystemHealth {
    status: SystemStatus;
    timestamp: number;
    lastAction: string;
    checks: {
        imports: {
            passed: boolean;
            totalFiles: number;
            totalImports: number;
            brokenCount: number;
            details: ScanResult['brokenImports'];
        };
        types: {
            passed: boolean;
            errorCount: number;
            duration: number;
            details: TypeCheckResult['errors'];
        };
        circularDeps: {
            passed: boolean;
            cycleCount: number;
            details: DepGraphResult['cycles'];
        };
    };
    summary: string;
}

// ============================================================================
// HEALTH FILE MANAGEMENT
// ============================================================================

const HEALTH_FILE = path.join(process.cwd(), '.ai', 'system-health.json');

/**
 * Write system health to JSON (atomic)
 */
function writeHealth(health: SystemHealth): void {
    try {
        const dir = path.dirname(HEALTH_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const tempFile = `${HEALTH_FILE}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(health, null, 2), 'utf-8');
        fs.renameSync(tempFile, HEALTH_FILE);

        console.log(`\n📝 System health written to: ${HEALTH_FILE}`);
    } catch (err) {
        console.error('Failed to write health file:', err);
    }
}

/**
 * Save snapshot to history
 */
function saveSnapshot(health: SystemHealth): void {
    try {
        const historyDir = path.join(process.cwd(), '.ai', 'history');
        if (!fs.existsSync(historyDir)) {
            fs.mkdirSync(historyDir, { recursive: true });
        }

        const date = new Date().toISOString().split('T')[0];
        const snapshotFile = path.join(historyDir, `${date}.json`);
        fs.writeFileSync(snapshotFile, JSON.stringify(health, null, 2), 'utf-8');
    } catch (err) {
        console.error('Failed to save snapshot:', err);
    }
}

// ============================================================================
// MAIN SENTINEL
// ============================================================================

async function runSentinel(): Promise<number> {
    console.log('🛡️  AEGIS SENTINEL - Guardian Awakens\n');
    console.log('━'.repeat(60));

    const startTime = Date.now();
    const projectRoot = process.cwd();
    const srcDir = path.join(projectRoot, 'src');

    // ========================================
    // CHECK 1: Import Validation
    // ========================================
    console.log('\n📦 STEP 1: Validating Imports...');
    console.log('━'.repeat(60));

    let importResult: ScanResult;
    try {
        importResult = scanImports(srcDir);
    } catch (err) {
        console.error('Import scan failed:', err);
        importResult = {
            totalFiles: 0,
            totalImports: 0,
            brokenImports: [],
            success: false
        };
    }

    // ========================================
    // CHECK 2: Type Validation
    // ========================================
    console.log('\n🔍 STEP 2: Type Checking...');
    console.log('━'.repeat(60));

    let typeResult: TypeCheckResult;
    try {
        typeResult = await runTypeCheck(projectRoot);
    } catch (err) {
        console.error('Type check failed:', err);
        typeResult = {
            success: false,
            errors: [],
            duration: 0
        };
    }

    // ========================================
    // CHECK 3: Circular Dependencies
    // ========================================
    console.log('\n🔄 STEP 3: Circular Dependency Check...');
    console.log('━'.repeat(60));

    let depGraphResult: DepGraphResult;
    try {
        const files = importResult.totalFiles > 0
            ? getAllFiles(srcDir)
            : [];
        depGraphResult = detectCircularDependencies(srcDir, files);
    } catch (err) {
        console.error('Dependency graph check failed:', err);
        depGraphResult = {
            success: false,
            cycles: []
        };
    }

    // ========================================
    // DETERMINE STATUS
    // ========================================
    const allPassed = importResult.success && typeResult.success && depGraphResult.success;
    const anyFailed = !importResult.success || !typeResult.success || !depGraphResult.success;

    let status: SystemStatus;
    if (allPassed) {
        status = 'HEALTHY';
    } else if (anyFailed) {
        status = 'BROKEN';
    } else {
        status = 'DEGRADED';
    }

    // ========================================
    // BUILD HEALTH REPORT
    // ========================================
    const health: SystemHealth = {
        status,
        timestamp: Date.now(),
        lastAction: 'Sentinel scan',
        checks: {
            imports: {
                passed: importResult.success,
                totalFiles: importResult.totalFiles,
                totalImports: importResult.totalImports,
                brokenCount: importResult.brokenImports.length,
                details: importResult.brokenImports
            },
            types: {
                passed: typeResult.success,
                errorCount: typeResult.errors.length,
                duration: typeResult.duration,
                details: typeResult.errors
            },
            circularDeps: {
                passed: depGraphResult.success,
                cycleCount: depGraphResult.cycles.length,
                details: depGraphResult.cycles
            }
        },
        summary: allPassed
            ? '✅ All checks passed. System is healthy.'
            : `❌ ${[!importResult.success && 'imports', !typeResult.success && 'types', !depGraphResult.success && 'circular deps'].filter(Boolean).join(', ')} failed.`
    };

    // ========================================
    // OUTPUT SUMMARY
    // ========================================
    const duration = Date.now() - startTime;

    console.log('\n━'.repeat(60));
    console.log('📊 SENTINEL REPORT');
    console.log('━'.repeat(60));
    console.log(`\n🔍 Import Validation: ${importResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Files scanned: ${importResult.totalFiles}`);
    console.log(`   Imports checked: ${importResult.totalImports}`);
    console.log(`   Broken imports: ${importResult.brokenImports.length}`);

    console.log(`\n🔍 Type Checking: ${typeResult.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Type errors: ${typeResult.errors.length}`);
    saveSnapshot(health);

    // ========================================
    // EXIT CODE
    // ========================================
    return status === 'HEALTHY' ? 0 : 1;
}

// ============================================================================
// HELPERS
// ============================================================================

function getAllFiles(dir: string): string[] {
    const files: string[] = [];

    function walk(currentDir: string) {
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
                    walk(fullPath);
                } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        } catch (err) {
            console.error(`Failed to read ${ currentDir }: `, err);
        }
    }

    walk(dir);
    return files;
}

// ============================================================================
// RUN
// ============================================================================

runSentinel()
    .then((exitCode) => {
        process.exit(exitCode);
    })
    .catch((err) => {
        console.error('\n❌ Sentinel crashed:', err);
        process.exit(1);
    });
