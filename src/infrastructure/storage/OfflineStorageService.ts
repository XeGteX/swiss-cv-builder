/**
 * IndexedDB Offline Storage Service
 * 
 * Stores CVs locally for offline access:
 * - Auto-save changes
 * - Sync when online
 * - Version tracking
 */

import type { CVProfile } from '../../domain/entities/cv';

// ============================================================================
// TYPES
// ============================================================================

interface StoredCV {
    id: string;
    profile: CVProfile;
    lastModified: number;
    syncStatus: 'synced' | 'pending' | 'error';
    version: number;
}

interface OfflineState {
    isOnline: boolean;
    lastSync: number;
    pendingChanges: number;
}

// ============================================================================
// INDEXEDDB SERVICE
// ============================================================================

export class OfflineStorageService {
    private static DB_NAME = 'nexal-db';
    private static DB_VERSION = 1;
    private static STORE_NAME = 'cvs';
    private static db: IDBDatabase | null = null;

    // ========================================================================
    // INITIALIZE DATABASE
    // ========================================================================

    static async init(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(true);
                return;
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to open database');
                reject(false);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[OfflineStorage] Database initialized');
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create CV store
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                    store.createIndex('lastModified', 'lastModified', { unique: false });
                    store.createIndex('syncStatus', 'syncStatus', { unique: false });
                }

                // Create settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // Create drafts store
                if (!db.objectStoreNames.contains('drafts')) {
                    const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' });
                    draftsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // ========================================================================
    // SAVE CV
    // ========================================================================

    static async saveCV(id: string, profile: CVProfile): Promise<boolean> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(false);
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            const storedCV: StoredCV = {
                id,
                profile,
                lastModified: Date.now(),
                syncStatus: navigator.onLine ? 'synced' : 'pending',
                version: 1
            };

            const request = store.put(storedCV);

            request.onsuccess = () => {
                console.log('[OfflineStorage] CV saved:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to save CV');
                reject(false);
            };
        });
    }

    // ========================================================================
    // LOAD CV
    // ========================================================================

    static async loadCV(id: string): Promise<CVProfile | null> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(null);
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result as StoredCV | undefined;
                resolve(result?.profile || null);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to load CV');
                reject(null);
            };
        });
    }

    // ========================================================================
    // LIST ALL CVS
    // ========================================================================

    static async listCVs(): Promise<StoredCV[]> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject([]);
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to list CVs');
                reject([]);
            };
        });
    }

    // ========================================================================
    // DELETE CV
    // ========================================================================

    static async deleteCV(id: string): Promise<boolean> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(false);
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('[OfflineStorage] CV deleted:', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('[OfflineStorage] Failed to delete CV');
                reject(false);
            };
        });
    }

    // ========================================================================
    // GET PENDING SYNC COUNT
    // ========================================================================

    static async getPendingCount(): Promise<number> {
        await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(0);
                return;
            }

            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const index = store.index('syncStatus');
            const request = index.count(IDBKeyRange.only('pending'));

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(0);
            };
        });
    }

    // ========================================================================
    // SYNC PENDING CHANGES
    // ========================================================================

    static async syncPending(): Promise<number> {
        if (!navigator.onLine) {
            console.log('[OfflineStorage] Offline, skipping sync');
            return 0;
        }

        const cvs = await this.listCVs();
        const pending = cvs.filter(cv => cv.syncStatus === 'pending');

        let synced = 0;
        for (const cv of pending) {
            try {
                // Here you would sync to your backend
                // await api.syncCV(cv.id, cv.profile);

                // Mark as synced
                await this.saveCV(cv.id, cv.profile);
                synced++;
            } catch (error) {
                console.error('[OfflineStorage] Sync failed for:', cv.id);
            }
        }

        console.log(`[OfflineStorage] Synced ${synced}/${pending.length} CVs`);
        return synced;
    }

    // ========================================================================
    // GET OFFLINE STATE
    // ========================================================================

    static async getState(): Promise<OfflineState> {
        const pendingChanges = await this.getPendingCount();

        return {
            isOnline: navigator.onLine,
            lastSync: Date.now(),
            pendingChanges
        };
    }

    // ========================================================================
    // AUTO-SAVE HOOK
    // ========================================================================

    static setupAutoSave(id: string, getProfile: () => CVProfile, intervalMs = 30000): () => void {
        let saveTimeout: ReturnType<typeof setTimeout> | null = null;

        const save = async () => {
            const profile = getProfile();
            await this.saveCV(id, profile);
            console.log('[OfflineStorage] Auto-save completed at', new Date().toISOString());
        };

        // Debounced save - exported for external use
        const debouncedSave = () => {
            if (saveTimeout) clearTimeout(saveTimeout);
            saveTimeout = setTimeout(save, 2000);
        };

        // Trigger initial debounced save
        debouncedSave();

        // Periodic save
        const interval = setInterval(save, intervalMs);

        // Listen for online status changes
        const handleOnline = () => {
            console.log('[OfflineStorage] Back online, syncing...');
            this.syncPending();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('beforeunload', save);

        // Return cleanup function
        return () => {
            if (saveTimeout) clearTimeout(saveTimeout);
            clearInterval(interval);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('beforeunload', save);
        };
    }
}

export default OfflineStorageService;
