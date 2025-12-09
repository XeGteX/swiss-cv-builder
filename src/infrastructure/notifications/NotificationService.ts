/**
 * Notification Service
 * 
 * Push notifications for:
 * - CV autosave confirmation
 * - AI analysis complete
 * - Sync status
 * - Tips and reminders
 */

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'ai';

export interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
}

export interface NotificationOptions {
    title: string;
    body: string;
    type?: NotificationType;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: NotificationAction[];
    data?: Record<string, unknown>;
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export class NotificationService {
    private static permission: NotificationPermission = 'default';

    // ========================================================================
    // REQUEST PERMISSION
    // ========================================================================

    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('[Notifications] Not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    // ========================================================================
    // CHECK PERMISSION
    // ========================================================================

    static isPermissionGranted(): boolean {
        return this.permission === 'granted' || Notification.permission === 'granted';
    }

    // ========================================================================
    // SEND NOTIFICATION
    // ========================================================================

    static async send(options: NotificationOptions): Promise<boolean> {
        if (!this.isPermissionGranted()) {
            const granted = await this.requestPermission();
            if (!granted) return false;
        }

        try {
            const icon = this.getIconForType(options.type);

            const notification = new Notification(options.title, {
                body: options.body,
                icon: options.icon || icon,
                badge: options.badge || '/icons/badge.png',
                tag: options.tag,
                requireInteraction: options.requireInteraction,
                data: options.data
            });

            // Handle click
            notification.onclick = () => {
                window.focus();
                notification.close();

                // Handle custom action from data
                if (options.data?.action && typeof options.data.action === 'string') {
                    this.handleAction(options.data.action);
                }
            };

            return true;
        } catch (error) {
            console.error('[Notifications] Failed to send:', error);
            return false;
        }
    }

    // ========================================================================
    // PRESET NOTIFICATIONS
    // ========================================================================

    static async notifyAutoSave(): Promise<void> {
        await this.send({
            title: '💾 Sauvegarde automatique',
            body: 'Votre CV a été sauvegardé',
            type: 'success',
            tag: 'autosave'
        });
    }

    static async notifyAIComplete(action: string): Promise<void> {
        await this.send({
            title: '✨ Analyse IA terminée',
            body: `${action} - Consultez les résultats`,
            type: 'ai',
            tag: 'ai-complete',
            requireInteraction: true
        });
    }

    static async notifySyncComplete(count: number): Promise<void> {
        await this.send({
            title: '🔄 Synchronisation terminée',
            body: `${count} modification(s) synchronisée(s)`,
            type: 'info',
            tag: 'sync'
        });
    }

    static async notifyOffline(): Promise<void> {
        await this.send({
            title: '📴 Mode hors ligne',
            body: 'Vos modifications seront synchronisées quand vous serez en ligne',
            type: 'warning',
            tag: 'offline'
        });
    }

    static async notifyBackOnline(): Promise<void> {
        await this.send({
            title: '🌐 Connexion rétablie',
            body: 'Synchronisation en cours...',
            type: 'success',
            tag: 'online'
        });
    }

    static async notifyTip(tip: string): Promise<void> {
        await this.send({
            title: '💡 Conseil NEXAL',
            body: tip,
            type: 'info',
            tag: 'tip'
        });
    }

    static async notifyExportReady(format: string): Promise<void> {
        await this.send({
            title: '📥 Export prêt',
            body: `Votre CV au format ${format.toUpperCase()} est prêt`,
            type: 'success',
            tag: 'export',
            data: { action: 'download' }
        });
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private static getIconForType(type?: NotificationType): string {
        switch (type) {
            case 'success':
                return '/icons/success.png';
            case 'warning':
                return '/icons/warning.png';
            case 'error':
                return '/icons/error.png';
            case 'ai':
                return '/icons/ai.png';
            default:
                return '/icons/info.png';
        }
    }

    private static handleAction(action: string): void {
        switch (action) {
            case 'download':
                // Trigger download
                console.log('[Notifications] Download action triggered');
                break;
            case 'view':
                // Navigate to specific view
                console.log('[Notifications] View action triggered');
                break;
            default:
                console.log('[Notifications] Unknown action:', action);
        }
    }

    // ========================================================================
    // SCHEDULE NOTIFICATIONS
    // ========================================================================

    static scheduleReminder(message: string, delayMs: number): void {
        setTimeout(() => {
            this.send({
                title: '⏰ Rappel NEXAL',
                body: message,
                type: 'info',
                tag: 'reminder',
                requireInteraction: true
            });
        }, delayMs);
    }

    // ========================================================================
    // TIPS ROTATION
    // ========================================================================

    private static tips = [
        "Utilisez des verbes d'action pour décrire vos expériences",
        "Quantifiez vos réalisations avec des chiffres",
        "Adaptez votre CV à chaque offre d'emploi",
        "Gardez votre CV sur une page si possible",
        "Incluez des mots-clés de l'offre d'emploi",
        "Vérifiez l'orthographe avant d'exporter"
    ];

    static startTipsRotation(intervalMs = 3600000): () => void {
        let tipIndex = 0;

        const interval = setInterval(() => {
            this.notifyTip(this.tips[tipIndex]);
            tipIndex = (tipIndex + 1) % this.tips.length;
        }, intervalMs);

        return () => clearInterval(interval);
    }
}

export default NotificationService;
