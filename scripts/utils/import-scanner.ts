/**
 * AEGIS SENTINEL - Import Scanner
 * 
 * Scans all TypeScript/React files for imports and validates they exist.
 * This is our DEAD LINK HUNTER.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ImportInfo {
    file: string;
    line: number;
    importPath: string;
    resolvedPath: string | null;
    exists: boolean;
}

export interface ScanResult {
    totalFiles: number;
    totalImports: number;
    brokenImports: ImportInfo[];
    success: boolean;
}

/**
 * Extract all import statements from a file
 * Handles: import X from 'Y', import { X } from 'Y', import * as X from 'Y'
 */
function extractImports(filePath: string): Array<{ line: number; importPath: string }> {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const imports: Array<{ line: number; importPath: string }> = [];

        // Regex patterns for different import styles
        const patterns = [
            /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,    // import X from 'Y'
            /import\s+['"]([^'"]+)['"]/g,                  // import 'Y'
            /require\(['"]([^'"]+)['"]\)/g                 // require('Y')
        ];

        lines.forEach((line, index) => {
            patterns.forEach(pattern => {
                const matches = line.matchAll(pattern);
                for (const match of matches) {
                    const importPath = match[1];
                    // Skip node_modules and absolute imports
                    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
                        continue;
                    }
                    imports.push({
                        line: index + 1,
                        importPath
                    });
                }
            });
        });

        return imports;
    } catch (err) {
        console.error(`Failed to read ${filePath}:`, err);
        return [];
    }
}

/**
 * Resolve an import path to an actual file
 * Handles: .ts, .tsx, .js, .jsx, /index
 */
function resolveImportPath(fromFile: string, importPath: string): string | null {
    const fromDir = path.dirname(fromFile);
    const basePath = path.resolve(fromDir, importPath);

    // Try exact path first
    if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
        return basePath;
    }

    // Try with extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.d.ts'];
    for (const ext of extensions) {
        const withExt = basePath + ext;
        if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
            return withExt;
        }
    }

    // Try as directory with index
    for (const ext of extensions) {
        const indexPath = path.join(basePath, `index${ext}`);
        if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
            return indexPath;
        }
    }

    return null;
}

/**
 * Recursively find all TypeScript/React files in a directory
 */
function findAllFiles(dir: string, extensions: string[] = ['.ts', '.tsx']): string[] {
    const files: string[] = [];

    function walk(currentDir: string) {
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                // Skip node_modules, .git, dist, build
                if (entry.isDirectory()) {
                    if (!['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
                        walk(fullPath);
                    }
                } else if (entry.isFile()) {
                    if (extensions.some(ext => entry.name.endsWith(ext))) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (err) {
            console.error(`Failed to read directory ${currentDir}:`, err);
        }
    }

    walk(dir);
    return files;
}

/**
 * Scan a directory for broken imports
 */
export function scanImports(rootDir: string): ScanResult {
    console.log(`🔍 Scanning imports in ${rootDir}...`);

    const files = findAllFiles(rootDir);
    console.log(`📁 Found ${files.length} files`);

    let totalImports = 0;
    const brokenImports: ImportInfo[] = [];

    for (const file of files) {
        const imports = extractImports(file);
        totalImports += imports.length;

        for (const imp of imports) {
            const resolvedPath = resolveImportPath(file, imp.importPath);
            const exists = resolvedPath !== null;

            if (!exists) {
                brokenImports.push({
                    file: path.relative(rootDir, file),
                    line: imp.line,
                    importPath: imp.importPath,
                    resolvedPath,
                    exists
                });
            }
        }
    }

    console.log(`✅ Scanned ${totalImports} imports`);

    if (brokenImports.length > 0) {
        console.log(`❌ Found ${brokenImports.length} broken imports`);
    } else {
        console.log(`✅ All imports are valid!`);
    }

    return {
        totalFiles: files.length,
        totalImports,
        brokenImports,
        success: brokenImports.length === 0
    };
}
