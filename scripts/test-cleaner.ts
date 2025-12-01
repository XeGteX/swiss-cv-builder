/**
 * Test Script for AEGIS Cleaner Agent
 * 
 * Usage: tsx scripts/test-cleaner.ts
 */

import { CleanerAgent } from '../server/agents/cleaner-agent';

async function main() {
    console.log('🧪 Testing AEGIS Cleaner Agent\n');
    console.log('━'.repeat(60));

    const agent = new CleanerAgent();

    try {
        // Run the agent
        await agent.run();

        console.log('\n━'.repeat(60));
        console.log('✅ Test completed successfully');
        console.log('\n💡 Check .ai/cleanup-manifest.json for results');

        process.exit(0);
    } catch (err) {
        console.error('\n❌ Test failed:', err);
        process.exit(1);
    }
}

main();
