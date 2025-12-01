/**
 * AEGIS SENTINEL - Type Checker
 * 
 * Wraps TypeScript compiler to validate types.
 * This is our COMPILER JUDGE.
 */

import { spawn } from 'child_process';
import * as path from 'path';

export interface TypeErrorInfo {
    file: string;
    line: number;
    column: number;
    message: string;
    code: string;
}

export interface TypeCheckResult {
    success: boolean;
    errors: TypeErrorInfo[];
    duration: number;
}

/**
 * Parse TypeScript compiler output
 * Format: "src/App.tsx(42,15): error TS2304: Cannot find name 'Foo'."
 */
function parseTypeScriptError(line: string): TypeErrorInfo | null {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);

    if (!match) return null;

    return {
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4],
        message: match[5]
    };
}

/**
 * Run TypeScript compiler in check mode
 */
export function runTypeCheck(projectRoot: string): Promise<TypeCheckResult> {
    return new Promise((resolve) => {
        const startTime = Date.now();
        console.log('🔍 Running TypeScript compiler...');

        const tsc = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck'], {
            cwd: projectRoot,
            shell: true
        });

        let stdout = '';
        let stderr = '';

        tsc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        tsc.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        tsc.on('close', (code) => {
            const duration = Date.now() - startTime;
            const output = stdout + stderr;
            const lines = output.split('\n');

            const errors: TypeErrorInfo[] = [];
            for (const line of lines) {
                const error = parseTypeScriptError(line);
                if (error) {
                    errors.push(error);
                }
            }

            const success = code === 0 && errors.length === 0;

            if (success) {
                console.log(`✅ Type checking passed (${duration}ms)`);
            } else {
                console.log(`❌ Found ${errors.length} type errors (${duration}ms)`);
            }

            resolve({
                success,
                errors,
                duration
            });
        });

        tsc.on('error', (err) => {
            console.error('Failed to run TypeScript compiler:', err);
            resolve({
                success: false,
                errors: [],
                duration: Date.now() - startTime
            });
        });
    });
}
