/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   KAIROS CLEANER v1.2 - Dead Code Hunter with Sanctuary Protocol
 *   "Le temps révèle tout. Les morts doivent partir."
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs';
import * as path from 'path';
import { speak } from '../system/language-matrix';

interface DeadFile {
    path: string;
    relativePath: string;
    size: number;
    lastModified: Date;
    reason: string;
}

export interface KairosReport {
    scanDate: Date;
    filesScanned: number;
    orphansFound: number;
    deadFiles: DeadFile[];
    totalWasteBytes: number;
}

/**
 * KAIROS Cleaner - Dead Code Detection Agent
 */
export class KairosCleaner {
    private rootDir: string;
    private report: KairosReport | null = null;
    private readonly IGNORED_DIRS = ['node_modules', 'dist', 'dist-server', '.git', '.gemini', 'build'];
    private readonly IGNORED_FILES = [
        'vite.config.ts',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
        'tsconfig.server.json',
        'package.json',
        'postcss.config.js',
        'tailwind.config.js'
    ];
    private readonly ENTRY_POINTS = ['main.tsx', 'App.tsx', 'index.ts', 'server.ts'];

    constructor(rootDir: string = process.cwd()) {
        this.rootDir = path.join(rootDir, 'src');
    }

    /**
     * Scan for dead code
     */
    public async scanDeadCode(): Promise<KairosReport> {
        console.log(speak('KAIROS', 'PERFORMANCE_CHECK'));

        const startTime = Date.now();

        // Step 1: Collect all files
        const allFiles = this.collectFiles(this.rootDir);
        console.log(`[KAIROS] 📊 ${allFiles.length} fichiers collectés`);

        // Step 2: Build import graph
        const importGraph = this.buildImportGraph(allFiles);

        // Step 3: Find orphans
        const orphans = this.findOrphans(allFiles, importGraph);

        // Calculate waste
        const totalWaste = orphans.reduce((sum: number, file: DeadFile) => sum + file.size, 0);

        this.report = {
            scanDate: new Date(),
            filesScanned: allFiles.length,
            orphansFound: orphans.length,
            deadFiles: orphans,
            totalWasteBytes: totalWaste
        };

        const duration = Date.now() - startTime;
        console.log(`[KAIROS] 🧹 Analyse terminée en ${duration}ms. ${orphans.length} fichiers orphelins détectés.`);

        return this.report;
    }

    /**
     * Get current report
     */
    public getReport(): KairosReport | null {
        return this.report;
    }

    /**
     * Collect all source files recursively
     */
    private collectFiles(dir: string): string[] {
        const files: string[] = [];

        const scan = (currentDir: string) => {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                // Skip ignored directories
                if (entry.isDirectory()) {
                    if (this.IGNORED_DIRS.includes(entry.name)) continue;
                    scan(fullPath);
                    continue;
                }

                // Only process source files
                if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (['.ts', '.tsx', '.css', '.scss'].includes(ext)) {
                        // Skip ignored config files
                        if (this.IGNORED_FILES.includes(entry.name)) continue;
                        files.push(fullPath);
                    }
                }
            }
        };

        scan(dir);
        return files;
    }

    /**
     * Build import dependency graph
     */
    private buildImportGraph(files: string[]): Map<string, Set<string>> {
        const graph = new Map<string, Set<string>>();

        for (const file of files) {
            const imports = this.extractImports(file);
            graph.set(file, imports);
        }

        return graph;
    }

    /**
     * Extract all imports from a file
     */
    private extractImports(filePath: string): Set<string> {
        const imports = new Set<string>();

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            for (const line of lines) {
                // Match: import ... from '...'
                const importMatch = line.match(/import\s+.*?\s+from\s+['"](.+?)['"]/);
                if (importMatch) {
                    const importPath = importMatch[1];

                    // Resolve relative imports
                    if (importPath.startsWith('.')) {
                        const resolvedPath = this.resolveImport(filePath, importPath);
                        if (resolvedPath) {
                            imports.add(resolvedPath);
                        }
                    }
                }

                // Match: import '...'
                const directImportMatch = line.match(/import\s+['"](.+?)['"]/);
                if (directImportMatch) {
                    const importPath = directImportMatch[1];
                    if (importPath.startsWith('.')) {
                        const resolvedPath = this.resolveImport(filePath, importPath);
                        if (resolvedPath) {
                            imports.add(resolvedPath);
                        }
                    }
                }
            }
        } catch (error) {
            // File read error - skip
        }

        return imports;
    }

    /**
     * Resolve relative import to absolute path
     */
    private resolveImport(fromFile: string, importPath: string): string | null {
        const fromDir = path.dirname(fromFile);
        let resolved = path.resolve(fromDir, importPath);

        // Try with extensions
        const extensions = ['.ts', '.tsx', '.css', '.scss', '/index.ts', '/index.tsx'];

        for (const ext of extensions) {
            const candidate = resolved + ext;
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        // Try as-is
        if (fs.existsSync(resolved)) {
            return resolved;
        }

        return null;
    }

    /**
     * Check if file is vital (should never be flagged as orphan)
     * KAIROS v1.1 - False Positive Prevention
     */
    private isVitalFile(filePath: string): boolean {
        const relativePath = path.relative(process.cwd(), filePath);
        const basename = path.basename(filePath);

        // 1. Tests - Never flag test files
        if (basename.match(/\.(test|spec)\.(ts|tsx)$/)) {
            return true;
        }

        // 2. Workers - Never flag worker files
        if (relativePath.includes('worker') || basename.endsWith('.worker.ts')) {
            return true;
        }

        // 3. Special Pages - Puppeteer entry points
        if (basename === 'PDFRenderPage.tsx') {
            return true;
        }

        // 4. Styles - CSS/SCSS are imported differently
        if (basename.endsWith('.css') || basename.endsWith('.scss')) {
            return true;
        }

        // 5. V2 Architecture - Work in progress
        if (relativePath.includes('/v2/') || relativePath.includes('/atomic-editor/')) {
            return true;
        }

        return false;
    }

    /**
     * Check if file is in a sanctuarized zone
     * KAIROS v1.4 - OS Agnostic Sanctuary Protocol
     * 
     * Certain critical architectural components must be protected
     * even if they appear orphaned during incremental development.
     * 
     * v1.4 CHANGES:
     * - Normalized paths for Windows compatibility (backslash → forward slash)
     * - Added explicit file whitelist for common utilities
     */
    private isSanctuarized(filePath: string): boolean {
        const relativePath = path.relative(process.cwd(), filePath).toLowerCase();

        // ⚠️ CRITICAL: Normalize path separators for cross-platform compatibility
        // Windows uses backslashes (\), but our sanctuary keywords use forward slashes (/)
        const normalizedPath = relativePath.replace(/\\/g, '/');

        // Extract filename for explicit checks
        const basename = path.basename(filePath).toLowerCase();

        // Explicit file whitelist - Common utilities often flagged as orphans
        const explicitWhitelist = [
            'feature-flags.ts',
            'feature-flags.tsx',
            'tokens.ts',
            'tokens.tsx',
            'constants.ts'
        ];

        if (explicitWhitelist.includes(basename)) {
            return true;
        }

        // Sanctuary keywords (directories & patterns)
        const sanctuaries = [
            'domain',          // ⭐ CRITICAL - Domain layer (Business Logic) - NEVER DELETE
            'v2',              // New architecture
            'admin',           // Admin dashboard
            'infrastructure',  // EventBus & core services
            'types',           // TypeScript definitions
            'worker',          // Background threads
            'test',            // QA files
            '__tests__',       // Alternative test directory
            '/ai/',            // AI Brain modules (nano-brain, semantic-analyzer, etc.)
            '/bi/',            // Business Intelligence & Strategy
            '/intelligence/',  // Intelligence Tracker
            '/scv/'            // Data Mapper (Système de Cartographie des Valeurs)
        ];

        // Check if NORMALIZED path contains any sanctuary keyword
        for (const sanctuary of sanctuaries) {
            if (normalizedPath.includes(sanctuary)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Find orphaned files (not imported by anyone)
     */
    private findOrphans(allFiles: string[], importGraph: Map<string, Set<string>>): DeadFile[] {
        const orphans: DeadFile[] = [];

        // Build reverse map: file -> importers
        const importedBy = new Map<string, Set<string>>();

        for (const [file, imports] of importGraph) {
            for (const imported of imports) {
                if (!importedBy.has(imported)) {
                    importedBy.set(imported, new Set());
                }
                importedBy.get(imported)!.add(file);
            }
        }

        // Check each file
        for (const file of allFiles) {
            const basename = path.basename(file);

            // Skip entry points
            if (this.ENTRY_POINTS.includes(basename)) continue;

            // ⚠️ KAIROS v1.2 - Sanctuary Protocol (CRITICAL)
            if (this.isSanctuarized(file)) {
                console.log(`[KAIROS] 🛡️ Fichier sanctuarisé : ${path.relative(process.cwd(), file)}`);
                continue;
            }

            // ⚠️ KAIROS v1.1 - Skip vital files (False Positive Prevention)
            if (this.isVitalFile(file)) {
                console.log(`[KAIROS] 🛡️ Fichier vital protégé : ${path.relative(process.cwd(), file)}`);
                continue;
            }

            // Check if imported
            if (!importedBy.has(file) || importedBy.get(file)!.size === 0) {
                const stats = fs.statSync(file);
                orphans.push({
                    path: file,
                    relativePath: path.relative(process.cwd(), file),
                    size: stats.size,
                    lastModified: stats.mtime,
                    reason: 'Jamais importé'
                });
            }
        }

        return orphans;
    }

    /**
     * Quarantine a file (rename to .bak)
     */
    public quarantineFile(filePath: string): boolean {
        try {
            const bakPath = filePath + '.bak';
            fs.renameSync(filePath, bakPath);
            console.log(`[KAIROS] 🗑️ Fichier mis en quarantaine : ${filePath}`);
            return true;
        } catch (error) {
            console.error(`[KAIROS] ❌ Échec quarantaine : ${error}`);
            return false;
        }
    }

    /**
     * Purge dead files
     * @param filePaths Optional array of specific file paths to purge. If not provided, purges all.
     */
    public purgeDeadFiles(filePaths?: string[]): number {
        if (!this.report) return 0;

        let purged = 0;
        const filesToPurge = filePaths
            ? this.report.deadFiles.filter(df => filePaths.includes(df.path))
            : this.report.deadFiles;

        for (const deadFile of filesToPurge) {
            if (this.quarantineFile(deadFile.path)) {
                purged++;

                // Remove from report after successful quarantine
                const index = this.report.deadFiles.findIndex(f => f.path === deadFile.path);
                if (index !== -1) {
                    this.report.deadFiles.splice(index, 1);
                    this.report.orphansFound--;
                }
            }
        }

        console.log(`[KAIROS] 🧹 ${purged} fichiers purgés`);
        return purged;
    }
}
