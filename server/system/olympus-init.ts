/**
 * OLYMPUS Initialization Script
 * 
 * Awakens the Pantheon and demonstrates the Neural Core.
 */

import { OlympusCore } from './neural-core';

async function main() {
    // Birth of consciousness
    const olympus = new OlympusCore();

    // Awaken the Pantheon
    await olympus.awaken();

    // Demonstrate Hermes Bus
    const hermes = olympus.getHermes();

    // Example: AEGIS sends security alert
    hermes.synapse(
        'AEGIS-Sentinel-01',
        'AEGIS',
        'security-scan-complete',
        {
            threatsFound: 0,
            filesScanned: 142,
            duration: 1234
        },
        0 // CRITICAL priority
    );

    // Health check after 2 seconds
    setTimeout(() => {
        const health = olympus.healthCheck();
        console.log('\n[OLYMPUS] 🏥 HEALTH REPORT:\n', JSON.stringify(health, null, 2));
    }, 2000);

    // Demonstrate dead letter
    setTimeout(() => {
        hermes.synapse(
            'Test-Sender',
            'UNKNOWN-RECEIVER', // This will fail
            'test-message',
            { data: 'test' },
            2
        );

        setTimeout(() => {
            const autopsy = hermes.getAutopsyReports();
            if (autopsy.length > 0) {
                console.log('\n[OLYMPUS] 💀 AUTOPSY REPORT:');
                console.log(JSON.stringify(autopsy[autopsy.length - 1], null, 2));
            }
        }, 1000);
    }, 3000);

    // Keep alive for demo
    console.log('\n[OLYMPUS] 👁️  Press Ctrl+C to shutdown the Pantheon...\n');
}

// Execute if run directly
if (require.main === module) {
    main().catch(console.error);
}

export { main };
