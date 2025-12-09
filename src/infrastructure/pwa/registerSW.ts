/**
 * Service Worker Registration
 * 
 * Registers the service worker for PWA functionality.
 * Call this from your main entry point (main.tsx).
 */

// Background Sync API type extension
interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
    sync?: SyncManager;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    // Skip in development - sw.ts is TypeScript and won't work with Vite dev server
    // @ts-ignore - import.meta.env is Vite-specific
    if (import.meta.env?.DEV) {
        console.log('[SW] Skipping in development mode');
        return null;
    }

    if (!('serviceWorker' in navigator)) {
        console.log('[SW] Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
        });

        console.log('[SW] Service worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000); // Every hour

        // Handle updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    console.log('[SW] New version available');
                    showUpdateNotification();
                }
            });
        });

        return registration;
    } catch (error) {
        console.error('[SW] Registration failed:', error);
        return null;
    }
}

/**
 * Show update notification to user
 */
function showUpdateNotification(): void {
    // You can customize this to show a toast or modal
    const shouldUpdate = window.confirm(
        'Une nouvelle version de NEXAL est disponible. Recharger la page?'
    );

    if (shouldUpdate) {
        window.location.reload();
    }
}

/**
 * Request to skip waiting and activate new service worker
 */
export function skipWaiting(): void {
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Clear all service worker caches
 */
export function clearCache(): void {
    navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
}

/**
 * Request background sync for CV changes
 */
export async function requestSync(tag = 'sync-cvs'): Promise<boolean> {
    try {
        const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistrationWithSync;

        if (!registration.sync) {
            console.warn('[SW] Background sync not supported');
            return false;
        }

        await registration.sync.register(tag);
        console.log('[SW] Background sync registered:', tag);
        return true;
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
        return false;
    }
}

export default registerServiceWorker;
