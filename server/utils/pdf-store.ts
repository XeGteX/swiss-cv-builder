import type { CVProfile } from '../../src/domain/entities/cv';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Debug log file path
const DEBUG_LOG = './pdf-store-debug.log';

function debugLog(message: string) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    console.log(`[PDFStore-DEBUG] ${message}`);
    try {
        fs.appendFileSync(DEBUG_LOG, logLine);
    } catch (e) {
        // Ignore write errors
    }
}

/**
 * Temporary in-memory storage for CV profiles during PDF generation
 * Profiles auto-delete after 60 seconds to prevent memory leaks
 */
class PDFStore {
    private profiles: Map<string, { profile: CVProfile; timestamp: number }> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Start cleanup task every 10 seconds
        this.cleanupInterval = setInterval(() => this.cleanup(), 10000);
        debugLog('PDFStore instance created - cleanup interval started');
    }

    /**
     * Store a CV profile and return its unique ID
     */
    store(profile: CVProfile): string {
        const id = uuidv4();
        this.profiles.set(id, {
            profile,
            timestamp: Date.now()
        });
        debugLog(`STORE: id=${id}, size=${this.profiles.size}, profile.firstName=${profile.personal?.firstName || 'N/A'}`);
        return id;
    }

    /**
     * Retrieve a CV profile by ID
     */
    get(id: string): CVProfile | null {
        debugLog(`GET: id=${id}, allIds=[${[...this.profiles.keys()].join(', ') || 'NONE'}], size=${this.profiles.size}`);

        const entry = this.profiles.get(id);
        if (!entry) {
            debugLog(`GET FAILED: id=${id} NOT FOUND`);
            return null;
        }
        const age = Date.now() - entry.timestamp;
        debugLog(`GET SUCCESS: id=${id}, age=${age}ms`);
        return entry.profile;
    }

    /**
     * Delete a profile by ID
     */
    delete(id: string): void {
        if (this.profiles.delete(id)) {
            console.log(`[PDFStore] Deleted profile ${id}`);
        }
    }

    /**
     * Remove profiles older than 60 seconds
     */
    private cleanup(): void {
        const now = Date.now();
        const maxAge = 60 * 1000; // 60 seconds
        let cleaned = 0;

        for (const [id, entry] of this.profiles.entries()) {
            if (now - entry.timestamp > maxAge) {
                this.profiles.delete(id);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[PDFStore] Cleanup: removed ${cleaned} expired profile(s), ${this.profiles.size} remaining`);
        }
    }

    /**
     * Stop cleanup interval (for graceful shutdown)
     */
    shutdown(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.profiles.clear();
        console.log('[PDFStore] Shutdown complete');
    }
}

// Singleton instance
export const pdfStore = new PDFStore();

// Graceful shutdown
process.on('SIGTERM', () => pdfStore.shutdown());
process.on('SIGINT', () => pdfStore.shutdown());
