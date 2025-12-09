/**
 * useOfflineStatus - Hook for offline/online status
 * 
 * Tracks network status and provides UI feedback.
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineStorageService } from '../../infrastructure/storage/OfflineStorageService';
import { NotificationService } from '../../infrastructure/notifications/NotificationService';

// ============================================================================
// TYPES
// ============================================================================

interface OfflineStatusState {
    isOnline: boolean;
    pendingChanges: number;
    lastSync: Date | null;
    isInitialized: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useOfflineStatus() {
    const [state, setState] = useState<OfflineStatusState>({
        isOnline: navigator.onLine,
        pendingChanges: 0,
        lastSync: null,
        isInitialized: false
    });

    // Initialize
    useEffect(() => {
        const init = async () => {
            await OfflineStorageService.init();
            const pendingChanges = await OfflineStorageService.getPendingCount();
            setState(prev => ({
                ...prev,
                pendingChanges,
                isInitialized: true
            }));
        };
        init();
    }, []);

    // Handle online/offline events
    useEffect(() => {
        const handleOnline = async () => {
            setState(prev => ({ ...prev, isOnline: true }));
            NotificationService.notifyBackOnline();

            // Sync pending changes
            const synced = await OfflineStorageService.syncPending();
            if (synced > 0) {
                NotificationService.notifySyncComplete(synced);
            }

            setState(prev => ({
                ...prev,
                pendingChanges: 0,
                lastSync: new Date()
            }));
        };

        const handleOffline = () => {
            setState(prev => ({ ...prev, isOnline: false }));
            NotificationService.notifyOffline();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Save CV with offline support
    const saveCV = useCallback(async (id: string, profile: any) => {
        await OfflineStorageService.saveCV(id, profile);

        if (!navigator.onLine) {
            setState(prev => ({
                ...prev,
                pendingChanges: prev.pendingChanges + 1
            }));
        }
    }, []);

    // Load CV
    const loadCV = useCallback(async (id: string) => {
        return OfflineStorageService.loadCV(id);
    }, []);

    // Manual sync
    const syncNow = useCallback(async () => {
        if (!navigator.onLine) return 0;

        const synced = await OfflineStorageService.syncPending();
        setState(prev => ({
            ...prev,
            pendingChanges: 0,
            lastSync: new Date()
        }));

        return synced;
    }, []);

    return {
        ...state,
        saveCV,
        loadCV,
        syncNow
    };
}

export default useOfflineStatus;
