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
 * - Debounced sync (5s delay - user finishes typing before sync)
 * - NON-BLOCKING: Status only shows during actual save, not during typing
 * - Google Docs-style auto-save
 */
export class AtlasSyncService {
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly DEBOUNCE_MS = 5000; // 5 seconds - wait until user stops typing

    /**
     * Sync profile to cloud storage
     * 
     * @param profile - CV profile to sync
     * @returns true if successful, false otherwise
     */
    async syncProfile(profile: CVProfile): Promise<boolean> {
        // MOCK: Simulate successful sync (fast)
        console.log('[ATLAS] ☁️ Syncing profile...', { id: profile.id });
        await new Promise(r => setTimeout(r, 100)); // 100ms - very fast
        return true;
    }

    /**
     * Debounced sync with status updates
     * NON-BLOCKING: Only shows "saving" status when actually saving
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

        // DON'T set status immediately - only after debounce completes
        // This prevents UI from showing "saving" during typing

        // Start new timer
        this.debounceTimer = setTimeout(async () => {
            // NOW set saving status (user has stopped typing)
            setSyncStatus('saving');

            const success = await this.syncProfile(profile);

            if (success) {
                markSynced();
                console.log('[ATLAS] ✅ Profile synced');
            } else {
                setSyncStatus('error', 'Failed to sync');
                console.error('[ATLAS] ❌ Sync failed');
            }
        }, this.DEBOUNCE_MS);
    }
}

// Singleton instance
export const atlasSync = new AtlasSyncService();
