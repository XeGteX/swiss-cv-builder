/**
 * AEGIS SENTINEL - Dependency Graph & Circular Detector
 * 
 * Builds a dependency graph and detects circular dependencies.
 * This is our CYCLE BREAKER.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface CircularDependency {
    cycle: string[];
}

export interface DepGraphResult {
    success: boolean;
    cycles: CircularDependency[];
}

/**
 * Build dependency graph from import statements
 */
class DependencyGraph {
    private adjacencyList: Map<string, Set<string>> = new Map();

    addEdge(from: string, to: string) {
        if (!this.adjacencyList.has(from)) {
            this.adjacencyList.set(from, new Set());
        }
        this.adjacencyList.get(from)!.add(to);
    }

    /**
     * Detect cycles using DFS
     */
    findCycles(): string[][] {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const cycles: string[][] = [];

        const dfs = (node: string, path: string[]): void => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);

            const neighbors = this.adjacencyList.get(node) || new Set();
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, [...path]);
                } else if (recursionStack.has(neighbor)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(neighbor);
                    if (cycleStart !== -1) {
                        const cycle = path.slice(cycleStart);
                        cycle.push(neighbor); // Close the cycle
                        cycles.push(cycle);
                    }
                }
            }

            recursionStack.delete(node);
        };

        for (const node of this.adjacencyList.keys()) {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        }

        return cycles;
    }
}

/**
 * Extract imports from a file (simplified)
 */
function extractImportsForGraph(filePath: string): string[] {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const imports: string[] = [];

        const patterns = [
            /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
            /import\s+['"]([^'"]+)['"]/g
        ];

        patterns.forEach(pattern => {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                imports.push(match[1]);
            }
        });

        return imports;
    } catch {
        return [];
    }
}

/**
 * Normalize file path for graph (remove extension, resolve relative)
 */
function normalizeFilePath(fromFile: string, importPath: string): string | null {
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        return null; // Skip external modules
    }

    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(fromDir, importPath);

    // Remove extension
    return resolved.replace(/\.(ts|tsx|js|jsx)$/, '');
}

/**
 * Build dependency graph and detect cycles
 */
export function detectCircularDependencies(rootDir: string, files: string[]): DepGraphResult {
    console.log('🔍 Building dependency graph...');

    const graph = new DependencyGraph();

    for (const file of files) {
        const imports = extractImportsForGraph(file);
        const normalizedFile = file.replace(/\.(ts|tsx|js|jsx)$/, '');

        for (const importPath of imports) {
            const normalizedImport = normalizeFilePath(file, importPath);
            if (normalizedImport) {
                graph.addEdge(normalizedFile, normalizedImport);
            }
        }
    }

    const cycles = graph.findCycles();

    if (cycles.length > 0) {
        console.log(`❌ Found ${cycles.length} circular dependencies`);
        cycles.forEach((cycle, index) => {
            console.log(`  Cycle ${index + 1}: ${cycle.join(' → ')}`);
        });
    } else {
        console.log('✅ No circular dependencies detected');
    }

    return {
        success: cycles.length === 0,
        cycles: cycles.map(cycle => ({ cycle }))
    };
}
