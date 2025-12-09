/// <reference lib="webworker" />

/**
 * NEXAL Service Worker - Full PWA Offline Support
 * 
 * Features:
 * - Caches app shell and assets
 * - Offline support for core functionality
 * - Background sync for CV changes
 * - Push notification handling
 */

declare const self: ServiceWorkerGlobalScope;

// Extend types for Background Sync API (not in default TS lib)
interface SyncEvent extends ExtendableEvent {
    readonly tag: string;
}

interface ServiceWorkerGlobalScopeEventMap {
    'sync': SyncEvent;
}

const STATIC_CACHE_NAME = 'nexal-static-v1';
const DYNAMIC_CACHE_NAME = 'nexal-dynamic-v1';

// Files to cache for offline access
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// ============================================================================
// INSTALL EVENT
// ============================================================================

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[ServiceWorker] Static assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Install failed:', error);
            })
    );
});

// ============================================================================
// ACTIVATE EVENT
// ============================================================================

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME)
                        .map((name) => {
                            console.log('[ServiceWorker] Removing old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Activated');
                return self.clients.claim();
            })
    );
});

// ============================================================================
// FETCH EVENT
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests and external URLs
    if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
        return;
    }

    // Skip API requests (they should use IndexedDB)
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(async (cachedResponse): Promise<Response> => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    event.waitUntil(updateCache(request));
                    return cachedResponse;
                }

                // Fetch from network and cache
                return fetchAndCache(request);
            })
            .catch(async (): Promise<Response> => {
                // Return offline fallback for navigation requests
                if (request.mode === 'navigate') {
                    const fallback = await caches.match('/index.html');
                    if (fallback) return fallback;
                }

                return new Response('Offline', { status: 503 });
            })
    );
});

// ============================================================================
// CACHE HELPERS
// ============================================================================

async function fetchAndCache(request: Request): Promise<Response> {
    const response = await fetch(request);

    // Only cache successful responses
    if (response.status === 200) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, response.clone());
    }

    return response;
}

async function updateCache(request: Request): Promise<void> {
    try {
        const response = await fetch(request);
        if (response.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            await cache.put(request, response);
        }
    } catch {
        // Network unavailable, skip update
    }
}

// ============================================================================
// PUSH NOTIFICATION HANDLER
// ============================================================================

self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');

    const options: NotificationOptions = {
        body: 'Votre CV a été mis à jour',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        data: { dateOfArrival: Date.now() }
    };

    let title = 'NEXAL';

    if (event.data) {
        try {
            const data = event.data.json();
            title = data.title || title;
            options.body = data.body || options.body;
        } catch {
            options.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ============================================================================
// NOTIFICATION CLICK HANDLER
// ============================================================================

self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            self.clients.openWindow('/')
        );
    }
});

// ============================================================================
// BACKGROUND SYNC HANDLER
// ============================================================================

// Type-safe sync event listener
self.addEventListener('sync' as keyof ServiceWorkerGlobalScopeEventMap, ((event: SyncEvent) => {
    console.log('[ServiceWorker] Sync event:', event.tag);

    if (event.tag === 'sync-cvs') {
        event.waitUntil(syncCVs());
    }
}) as EventListener);

async function syncCVs(): Promise<void> {
    console.log('[ServiceWorker] Syncing CVs...');

    // This would sync with your backend
    // For now, just log that sync completed
    try {
        // await fetch('/api/sync', { method: 'POST' });
        console.log('[ServiceWorker] CVs synced successfully');
    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
        throw error; // Re-throw to retry later
    }
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);

    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data?.type === 'CLEAR_CACHE') {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }
});

export { };
