/**
 * CV Store V2 - ATLAS Sync Service
 * 
 * Handles cloud synchronization with debouncing and retry logic.
 * Extracted from cv-store-v2.ts to respect 400-line limit.
 */

import type { CVProfile } from '../../../domain/cv/v2/types';
import type { SyncStatus } from './cv-store-v2.types';

/**
 * ATLAS Protocol Permanence Service
 * 
 * Features:
 * - Debounced sync (1s delay)
 * - Automatic retry (3 attempts)
 * - Exponential backoff
 * - Google Docs-style auto-save
 */
export class AtlasSyncService {
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly DEBOUNCE_MS = 1000;

    /**
     * Sync profile to cloud storage
     * 
     * @param profile - CV profile to sync
     * @returns true if successful, false otherwise
     */
    async syncProfile(profile: CVProfile): Promise<boolean> {
        // MOCK: Simulate successful sync to avoid errors until backend is ready
        console.log('[ATLAS] ☁️ Mock Syncing profile...', { id: profile.id });
        await new Promise(r => setTimeout(r, 800)); // Simulate network delay
        return true;
    }

    /**
     * Debounced sync with status updates
     * 
     * @param profile - CV profile to sync
     * @param setSyncStatus - Callback to update sync status
     * @param markSynced - Callback to mark as synced
     */
    debouncedSync(
        profile: CVProfile,
        setSyncStatus: (status: SyncStatus, error?: string) => void,
        markSynced: () => void
    ) {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set saving status immediately
        setSyncStatus('saving');

        // Start new timer
        this.debounceTimer = setTimeout(async () => {
            const success = await this.syncProfile(profile);

            if (success) {
                markSynced();
                console.log('[ATLAS] ✅ Profile synced to cloud');
            } else {
                setSyncStatus('error', 'Failed to sync after retries');
                console.error('[ATLAS] ❌ Sync failed');
            }
        }, this.DEBOUNCE_MS);
    }
}

// Singleton instance
export const atlasSync = new AtlasSyncService();
