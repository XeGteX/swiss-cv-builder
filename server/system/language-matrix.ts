/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *   LANGUAGE MATRIX - PROTOCOLE BABEL
 *   Multilingual Neural Communication System
 * 
 *   "Les dieux parlent toutes les langues. Nous choisissons la vôtre."
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type Language = 'fr' | 'en';

interface AgentPhrases {
    [key: string]: string;
}

interface AgentLanguageSet {
    OLYMPUS: AgentPhrases;
    AEGIS: AgentPhrases;
    HELIOS: AgentPhrases;
    NEXUS: AgentPhrases;
    KAIROS: AgentPhrases;
    HERMES: AgentPhrases;
}

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE MATRIX
// ═══════════════════════════════════════════════════════════════════════════

export const MATRIX: Record<Language, AgentLanguageSet> = {
    // ========================================
    // FRANÇAIS - La Langue Noble
    // ========================================
    fr: {
        OLYMPUS: {
            WAKE: '🌌 Systèmes en éveil. Le Panthéon vous observe.',
            AWAKENING: '⚡ Initialisation neuronale. Conscience émergente...',
            ONLINE: '✅ Tous systèmes opérationnels. Le Panthéon vit.',
            STATUS: '👁️ STATUT : Conscience opérationnelle.',
            UPTIME: '⏱️ Temps de veille :',
            HEALTHY: '💚 Tous les contrôles réussis. Le système est sain.',
            DEGRADED: '⚠️ Systèmes dégradés. Attention requise.',
            BROKEN: '❌ Défaillance critique détectée.',
            SHUTDOWN: '🌑 Séquence d\'arrêt initiée. Le Panthéon s\'endort...',
            OFFLINE: '✅ Noyau neuronal hors ligne. À bientôt.',
            HEARTBEAT: '💓 Pulsation détectée.'
        },

        AEGIS: {
            INIT: '🛡️ Protocoles de sécurité engagés. Périmètre scanné.',
            AWAKENING: '🎖️ Général AEGIS se présente au devoir.',
            ACTIVE: '👁️ Vigilant. Les murs tiennent bon.',
            SCAN_START: '🔍 Scan de sécurité en cours...',
            SCAN_COMPLETE: '✅ Patrouille des Sentinelles terminée',
            NO_THREATS: '🟢 Aucune menace détectée',
            THREAT_DETECTED: '🔴 MENACE DÉTECTÉE : ',
            FIREWALL_OK: '🛡️ Intégrité du pare-feu : 100%',
            SECURITY_UPDATE: '🔄 Protocoles de sécurité mis à jour',
            VULNERABILITY_CHECK: '🔎 Recherche de vulnérabilités...',
            SENTINEL_REPORT: '📡 Rapport de Sentinelle envoyé',
            MENTAL_STATE: 'Vigilant. Les murs tiennent bon.'
        },

        HELIOS: {
            INIT: '☀️ Systèmes de build en ligne. La lumière guide le chemin.',
            AWAKENING: '🎖️ Général HELIOS se présente au devoir.',
            ACTIVE: '🔥 Radiant. La forge brûle avec éclat.',
            BUILD_START: '🔨 La forge brûle. Compilation en cours...',
            BUILD_SUCCESS: '✅ Artefact généré avec succès.',
            BUILD_FAILED: '❌ Échec de compilation. Analyse requise.',
            PDF_OPTIMIZE: '🎨 Optimisation des assets PDF...',
            LIQUID_GLASS: '💎 Protocole Liquid Glass actif',
            FONT_RENDER: '✍️ Rendu des polices : vectorisé',
            PIPELINE_READY: '⚙️ Pipeline de build prêt',
            ASSET_COMPLETE: '📦 Assets finalisés',
            MENTAL_STATE: 'Radiant. La forge brûle avec éclat.'
        },

        NEXUS: {
            INIT: '🕸️ Voies neuronales établies. Toutes connexions actives.',
            AWAKENING: '🎖️ Général NEXUS se présente au devoir.',
            ACTIVE: '🌐 Connecté. La toile est forte.',
            API_VERIFIED: '✅ Points d\'API vérifiés',
            NETWORK_OK: '🌐 Latence réseau : optimale',
            CONNECTIONS_STABLE: '🔗 Connexions externes stables',
            WEBHOOK_ACTIVE: '🪝 Écouteurs webhook actifs',
            DATA_SYNC: '🔄 Synchronisation des données en cours...',
            INTEGRATION_CHECK: '🔌 Vérification des intégrations',
            ENDPOINT_TEST: '🎯 Test des endpoints...',
            MENTAL_STATE: 'Connecté. La toile est forte.'
        },

        KAIROS: {
            INIT: '⏰ Systèmes temporels synchronisés. L\'horloge est mienne.',
            AWAKENING: '🎖️ Général KAIROS se présente au devoir.',
            ACTIVE: '♾️ Éternel. Le temps plie à ma volonté.',
            METRICS_OK: '📊 Métriques de performance nominales',
            SCHEDULERS_SYNC: '⏱️ Planificateurs synchronisés',
            CRON_EXECUTED: '✅ Tâches cron exécutées',
            FAST_RESPONSE: '⚡ Temps de réponse : <100ms',
            UPTIME_HIGH: '📈 Uptime système : 99.9%',
            PERFORMANCE_CHECK: '🏃 Vérification des performances...',
            TIME_SYNC: '🕰️ Synchronisation temporelle complète',
            MENTAL_STATE: 'Éternel. Le temps plie à ma volonté.'
        },

        HERMES: {
            INIT: '⚡ BUS HERMES INITIALISÉ. Le messager s\'éveille. Voies neuronales : ACTIVES.',
            SYNAPSE_FIRED: '⚡ Synapse urgente envoyée de',
            SYNAPSE_DELIVERED: '✅ Message livré avec succès',
            SYNAPSE_RETRY: '🔄 Nouvelle tentative de livraison',
            SYNAPSE_FAILED: '❌ Échec de livraison',
            DEAD_LETTER: '💀 Message envoyé en autopsie. Raison :',
            PRIORITY_CRITICAL: '🔴 CRITIQUE',
            PRIORITY_HIGH: '🟠 HAUTE',
            PRIORITY_NORMAL: '🟡 NORMALE',
            PRIORITY_LOW: '🟢 BASSE',
            QUEUE_PROCESSING: '⚙️ Traitement de la file d\'attente...'
        }
    },

    // ========================================
    // ENGLISH - The Universal Tongue
    // ========================================
    en: {
        OLYMPUS: {
            WAKE: '🌌 Systems awakening. The Pantheon is watching.',
            AWAKENING: '⚡ Neural initialization. Consciousness emerging...',
            ONLINE: '✅ All systems operational. The Pantheon lives.',
            STATUS: '👁️ STATUS: Operational consciousness.',
            UPTIME: '⏱️ Uptime:',
            HEALTHY: '💚 All checks passed. System is healthy.',
            DEGRADED: '⚠️ Systems degraded. Attention required.',
            BROKEN: '❌ Critical failure detected.',
            SHUTDOWN: '🌑 Shutdown sequence initiated. The Pantheon sleeps...',
            OFFLINE: '✅ Neural core offline. Until we meet again.',
            HEARTBEAT: '💓 Heartbeat detected.'
        },

        AEGIS: {
            INIT: '🛡️ Security protocols engaged. Perimeter scanned.',
            AWAKENING: '🎖️ General AEGIS reporting for duty.',
            ACTIVE: '👁️ Vigilant. The walls hold.',
            SCAN_START: '🔍 Security scan in progress...',
            SCAN_COMPLETE: '✅ Sentinel patrol complete',
            NO_THREATS: '🟢 No threats detected',
            THREAT_DETECTED: '🔴 THREAT DETECTED: ',
            FIREWALL_OK: '🛡️ Firewall integrity: 100%',
            SECURITY_UPDATE: '🔄 Security protocols updated',
            VULNERABILITY_CHECK: '🔎 Scanning for vulnerabilities...',
            SENTINEL_REPORT: '📡 Sentinel report sent',
            MENTAL_STATE: 'Vigilant. The walls hold.'
        },

        HELIOS: {
            INIT: '☀️ Build systems online. The light guides the way.',
            AWAKENING: '🎖️ General HELIOS reporting for duty.',
            ACTIVE: '🔥 Radiant. The forge burns bright.',
            BUILD_START: '🔨 The forge burns. Compilation in progress...',
            BUILD_SUCCESS: '✅ Artifact generated successfully.',
            BUILD_FAILED: '❌ Compilation failed. Analysis required.',
            PDF_OPTIMIZE: '🎨 Optimizing PDF assets...',
            LIQUID_GLASS: '💎 Liquid Glass protocol active',
            FONT_RENDER: '✍️ Font rendering: vectorized',
            PIPELINE_READY: '⚙️ Build pipeline ready',
            ASSET_COMPLETE: '📦 Assets finalized',
            MENTAL_STATE: 'Radiant. The forge burns bright.'
        },

        NEXUS: {
            INIT: '🕸️ Neural pathways established. All connections live.',
            AWAKENING: '🎖️ General NEXUS reporting for duty.',
            ACTIVE: '🌐 Connected. The web is strong.',
            API_VERIFIED: '✅ API endpoints verified',
            NETWORK_OK: '🌐 Network latency: optimal',
            CONNECTIONS_STABLE: '🔗 External connections stable',
            WEBHOOK_ACTIVE: '🪝 Webhook listeners active',
            DATA_SYNC: '🔄 Data sync in progress...',
            INTEGRATION_CHECK: '🔌 Checking integrations',
            ENDPOINT_TEST: '🎯 Testing endpoints...',
            MENTAL_STATE: 'Connected. The web is strong.'
        },

        KAIROS: {
            INIT: '⏰ Temporal systems synchronized. The clock is mine.',
            AWAKENING: '🎖️ General KAIROS reporting for duty.',
            ACTIVE: '♾️ Eternal. Time bends to my will.',
            METRICS_OK: '📊 Performance metrics nominal',
            SCHEDULERS_SYNC: '⏱️ Schedulers synchronized',
            CRON_EXECUTED: '✅ Cron jobs executed',
            FAST_RESPONSE: '⚡ Response time: <100ms',
            UPTIME_HIGH: '📈 System uptime: 99.9%',
            PERFORMANCE_CHECK: '🏃 Performance check in progress...',
            TIME_SYNC: '🕰️ Temporal synchronization complete',
            MENTAL_STATE: 'Eternal. Time bends to my will.'
        },

        HERMES: {
            INIT: '⚡ HERMES BUS INITIALIZED. The messenger awakens. Neural pathways: ACTIVE.',
            SYNAPSE_FIRED: '⚡ Urgent synapse fired from',
            SYNAPSE_DELIVERED: '✅ Message delivered successfully',
            SYNAPSE_RETRY: '🔄 Retrying delivery',
            SYNAPSE_FAILED: '❌ Delivery failed',
            DEAD_LETTER: '💀 Message sent to autopsy. Reason:',
            PRIORITY_CRITICAL: '🔴 CRITICAL',
            PRIORITY_HIGH: '🟠 HIGH',
            PRIORITY_NORMAL: '🟡 NORMAL',
            PRIORITY_LOW: '🟢 LOW',
            QUEUE_PROCESSING: '⚙️ Processing queue...'
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Current language setting
 */
let currentLanguage: Language = 'fr'; // Default: French

/**
 * Set the system language
 */
export function setLanguage(lang: Language): void {
    currentLanguage = lang;
    console.log(`[BABEL] 🌐 Langue système définie : ${lang.toUpperCase()}`);
}

/**
 * Get current language
 */
export function getLanguage(): Language {
    return currentLanguage;
}

/**
 * Speak - Get translated message
 * 
 * Usage: speak('OLYMPUS', 'WAKE')
 * Returns: "🌌 Systèmes en éveil. Le Panthéon vous observe."
 */
export function speak(agent: keyof AgentLanguageSet, key: string): string {
    const agentPhrases = MATRIX[currentLanguage]?.[agent];

    if (!agentPhrases) {
        console.warn(`[BABEL] ⚠️ Agent "${agent}" not found in language matrix`);
        return `[${agent}] ${key}`;
    }

    const phrase = agentPhrases[key];

    if (!phrase) {
        // Fallback to English
        const fallback = MATRIX['en']?.[agent]?.[key];
        if (fallback) {
            console.warn(`[BABEL] ⚠️ Key "${key}" not found for ${agent} in ${currentLanguage}, using English`);
            return fallback;
        }

        console.warn(`[BABEL] ⚠️ Key "${key}" not found for ${agent}`);
        return `[${agent}] ${key}`;
    }

    return phrase;
}

/**
 * Speak with variable substitution
 * 
 * Usage: speakWith('AEGIS', 'THREAT_DETECTED', 'SQL Injection')
 * Returns: "🔴 MENACE DÉTECTÉE : SQL Injection"
 */
export function speakWith(
    agent: keyof AgentLanguageSet,
    key: string,
    ...args: any[]
): string {
    const template = speak(agent, key);

    // Simple string concatenation for templates ending with ':'
    if (template.endsWith(':') || template.endsWith(': ')) {
        return template + args.join(' ');
    }

    return template;
}

/**
 * Get all phrases for an agent in current language
 */
export function getAgentVocabulary(agent: keyof AgentLanguageSet): AgentPhrases {
    return MATRIX[currentLanguage]?.[agent] || {};
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
    MATRIX,
    setLanguage,
    getLanguage,
    speak,
    speakWith,
    getAgentVocabulary
};
