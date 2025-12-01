/**
 * 🧹 AEGIS CLEANER AGENT
 * 
 * Intelligent Garbage Collector for Technical Debt.
 * 
 * Identifies:
 * - Dead code (orphan files never imported)
 * - Legacy files (*.v1.*, *.old.*, etc.)
 * - Empty shells (files with no meaningful content)
 * 
 * DOES NOT DELETE - only reports candidates for human review.
 */

import { BaseAgent } from './base-agent';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

type CleanupReason = 'ORPHAN' | 'LEGACY_PATTERN' | 'EMPTY_SHELL' | 'DUPLICATE';
type Confidence = 'HIGH' | 'MEDIUM' | 'LOW';

interface CleanupCandidate {
    path: string;
    reason: CleanupReason;
    confidence: Confidence;
    description: string;
    fileSize?: number;
    lastModified?: number;
}

interface CleanupManifest {
    timestamp: number;
    totalScanned: number;
    candidates: CleanupCandidate[];
    summary: {
        orphans: number;
        legacy: number;
        empty: number;
        duplicates: number;
    };
}

interface DependencyGraph {
    [filePath: string]: Set<string>; // file -> files it imports
}

// ============================================================================
// CLEANER AGENT
// ============================================================================

export class CleanerAgent extends BaseAgent {
    name = 'AEGIS Cleaner';
    private projectRoot: string;
    private entryPoints: string[];
    private excludePatterns: string[];

    constructor() {
        super();
        this.initialize('cleaner', 'Technical Debt Hunter');
        this.projectRoot = process.cwd();
        this.entryPoints = [
            path.join(this.projectRoot, 'src', 'main.tsx'),
            path.join(this.projectRoot, 'server', 'index.ts'),
            path.join(this.projectRoot, 'server', 'app.ts')
        ];
        this.excludePatterns = [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.next',
            'coverage',
            '__tests__',
            'test',
            'tests',
            '.spec.',
            '.test.',
            'vite.config',
            'tsconfig',
            'eslint'
        ];
    }

    // ========================================
    // ANALYSIS
    // ========================================

    async analyze(): Promise<string> {
        console.log('🧹 CLEANER AGENT - Starting Technical Debt Analysis\n');

        const candidates: CleanupCandidate[] = [];

        // Scan 1: Dead Code
        console.log('📦 SCAN 1: Detecting Orphans (Dead Code)...');
        const orphans = await this.detectOrphans();
        candidates.push(...orphans);
        console.log(`   Found ${orphans.length} orphan files\n`);

        // Scan 2: Legacy Patterns
        console.log('👻 SCAN 2: Detecting Legacy Files...');
        const legacy = await this.detectLegacyFiles();
        candidates.push(...legacy);
        console.log(`   Found ${legacy.length} legacy files\n`);

        // Scan 3: Empty Shells
        console.log('🗑️  SCAN 3: Detecting Empty Shells...');
        const empty = await this.detectEmptyShells();
        candidates.push(...empty);
        console.log(`   Found ${empty.length} empty files\n`);

        return JSON.stringify({
            totalCandidates: candidates.length,
            breakdown: {
                orphans: orphans.length,
                legacy: legacy.length,
                empty: empty.length
            }
        }, null, 2);
    }

    // ========================================
    // EXECUTION
    // ========================================

    async execute(analysisResult: any): Promise<void> {
        console.log('🧹 CLEANER AGENT - Generating Cleanup Manifest\n');

        const candidates: CleanupCandidate[] = [];

        // Run all scans
        const orphans = await this.detectOrphans();
        const legacy = await this.detectLegacyFiles();
        const empty = await this.detectEmptyShells();

        candidates.push(...orphans, ...legacy, ...empty);

        // Build manifest
        const manifest: CleanupManifest = {
            timestamp: Date.now(),
            totalScanned: this.getAllProjectFiles().length,
            candidates,
            summary: {
                orphans: orphans.length,
                legacy: legacy.length,
                empty: empty.length,
                duplicates: 0 // Future enhancement
            }
        };

        // Save manifest
        const manifestPath = path.join(this.projectRoot, '.ai', 'cleanup-manifest.json');
        const dir = path.dirname(manifestPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
        console.log(`\n📝 Cleanup manifest saved to: ${manifestPath}`);
        console.log(`\n📊 Summary: ${candidates.length} candidates identified`);
        console.log(`   - Orphans: ${orphans.length}`);
        console.log(`   - Legacy: ${legacy.length}`);
        console.log(`   - Empty: ${empty.length}`);
    }

    // ========================================
    // SCAN 1: ORPHAN DETECTION
    // ========================================

    private async detectOrphans(): Promise<CleanupCandidate[]> {
        const graph = this.buildDependencyGraph();
        const allFiles = this.getAllProjectFiles();
        const reachable = this.getReachableFiles(graph);

        const orphans: CleanupCandidate[] = [];

        for (const file of allFiles) {
            // Skip entry points themselves
            if (this.entryPoints.some(ep => file.includes(path.basename(ep)))) {
                continue;
            }

            // Skip special directories
            if (this.shouldExclude(file)) {
                continue;
            }

            // Check if file is reachable from entry points
            if (!reachable.has(file)) {
                orphans.push({
                    path: path.relative(this.projectRoot, file),
                    reason: 'ORPHAN',
                    confidence: 'HIGH',
                    description: 'File is never imported in the dependency graph.'
                });
            }
        }

        return orphans;
    }

    // ========================================
    // SCAN 2: LEGACY PATTERN DETECTION
    // ========================================

    private async detectLegacyFiles(): Promise<CleanupCandidate[]> {
        const allFiles = this.getAllProjectFiles();
        const legacy: CleanupCandidate[] = [];

        const legacyPatterns = [
            /\.old\./i,
            /\.backup\./i,
            /_v\d+\./i,
            /\.v\d+\./i,
            /^temp_/i,
            /^copy_of_/i,
            /-old\./i,
            /-backup\./i,
            /\.deprecated\./i
        ];

        for (const file of allFiles) {
            const basename = path.basename(file);

            for (const pattern of legacyPatterns) {
                if (pattern.test(basename)) {
                    // Check if a newer version exists
                    const modernVersion = this.findModernVersion(file);

                    legacy.push({
                        path: path.relative(this.projectRoot, file),
                        reason: 'LEGACY_PATTERN',
                        confidence: modernVersion ? 'HIGH' : 'MEDIUM',
                        description: modernVersion
                            ? `Detected legacy pattern while modern version exists: ${path.basename(modernVersion)}`
                            : `Detected legacy pattern in filename: ${basename}`
                    });
                    break;
                }
            }
        }

        return legacy;
    }

    // ========================================
    // SCAN 3: EMPTY SHELL DETECTION
    // ========================================

    private async detectEmptyShells(): Promise<CleanupCandidate[]> {
        const allFiles = this.getAllProjectFiles();
        const empty: CleanupCandidate[] = [];

        for (const file of allFiles) {
            try {
                const stats = fs.statSync(file);
                const content = fs.readFileSync(file, 'utf-8');

                // Check file size
                if (stats.size < 50) {
                    empty.push({
                        path: path.relative(this.projectRoot, file),
                        reason: 'EMPTY_SHELL',
                        confidence: 'HIGH',
                        description: `File is only ${stats.size} bytes.`,
                        fileSize: stats.size,
                        lastModified: stats.mtimeMs
                    });
                    continue;
                }

                // Check if only comments/imports
                const meaningfulContent = this.extractMeaningfulContent(content);
                if (meaningfulContent.length < 20) {
                    empty.push({
                        path: path.relative(this.projectRoot, file),
                        reason: 'EMPTY_SHELL',
                        confidence: 'MEDIUM',
                        description: 'File contains only comments/imports without exports.',
                        fileSize: stats.size
                    });
                }
            } catch (err) {
                // Skip files that can't be read
                continue;
            }
        }

        return empty;
    }

    // ========================================
    // DEPENDENCY GRAPH BUILDER
    // ========================================

    private buildDependencyGraph(): DependencyGraph {
        const graph: DependencyGraph = {};
        const allFiles = this.getAllProjectFiles();

        for (const file of allFiles) {
            const imports = this.extractImports(file);
            graph[file] = new Set(imports);
        }

        return graph;
    }

    private extractImports(filePath: string): string[] {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const imports: string[] = [];

            const patterns = [
                /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
                /import\s+['"]([^'"]+)['"]/g,
                /require\(['"]([^'"]+)['"]\)/g
            ];

            patterns.forEach(pattern => {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    const importPath = match[1];
                    if (importPath.startsWith('.') || importPath.startsWith('/')) {
                        const resolved = this.resolveImportPath(filePath, importPath);
                        if (resolved) {
                            imports.push(resolved);
                        }
                    }
                }
            });

            return imports;
        } catch {
            return [];
        }
    }

    private resolveImportPath(fromFile: string, importPath: string): string | null {
        const fromDir = path.dirname(fromFile);
        const basePath = path.resolve(fromDir, importPath);

        // Try exact path
        if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
            return basePath;
        }

        // Try with extensions
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
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

    // ========================================
    // REACHABILITY ANALYSIS
    // ========================================

    private getReachableFiles(graph: DependencyGraph): Set<string> {
        const reachable = new Set<string>();
        const visited = new Set<string>();

        const dfs = (file: string) => {
            if (visited.has(file)) return;
            visited.add(file);
            reachable.add(file);

            const imports = graph[file] || new Set();
            for (const imported of imports) {
                dfs(imported);
            }
        };

        // Start from all entry points
        for (const entryPoint of this.entryPoints) {
            if (fs.existsSync(entryPoint)) {
                dfs(entryPoint);
            }
        }

        return reachable;
    }

    // ========================================
    // HELPERS
    // ========================================

    private getAllProjectFiles(): string[] {
        const files: string[] = [];
        const scanDirs = [
            path.join(this.projectRoot, 'src'),
            path.join(this.projectRoot, 'server')
        ];

        const walk = (dir: string) => {
            try {
                if (!fs.existsSync(dir)) return;

                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        if (!this.shouldExclude(entry.name)) {
                            walk(fullPath);
                        }
                    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
                        files.push(fullPath);
                    }
                }
            } catch (err) {
                // Skip unreadable directories
            }
        };

        scanDirs.forEach(walk);
        return files;
    }

    private shouldExclude(pathOrName: string): boolean {
        return this.excludePatterns.some(pattern => pathOrName.includes(pattern));
    }

    private findModernVersion(legacyFile: string): string | null {
        const dir = path.dirname(legacyFile);
        const basename = path.basename(legacyFile);

        // Remove legacy patterns to find modern version
        const modernName = basename
            .replace(/\.old/gi, '')
            .replace(/\.backup/gi, '')
            .replace(/_v\d+/gi, '')
            .replace(/\.v\d+/gi, '')
            .replace(/^temp_/gi, '')
            .replace(/^copy_of_/gi, '')
            .replace(/-old/gi, '')
            .replace(/-backup/gi, '')
            .replace(/\.deprecated/gi, '');

        if (modernName === basename) return null;

        const modernPath = path.join(dir, modernName);
        return fs.existsSync(modernPath) ? modernPath : null;
    }

    private extractMeaningfulContent(content: string): string {
        // Remove comments
        let meaningful = content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
            .replace(/\/\/.*/g, ''); // Line comments

        // Remove imports
        meaningful = meaningful
            .replace(/import\s+.*?;/g, '')
            .replace(/require\([^)]+\);?/g, '');

        // Remove whitespace
        meaningful = meaningful.replace(/\s+/g, '');

        return meaningful;
    }
}
