/**
 * Demo: Register Agents and Test Admin API
 * 
 * This file demonstrates how to register agents and test the admin API.
 */

import { CleanerAgent } from './agents/cleaner-agent';
import { agentManager } from './services/agent-manager';

// ============================================================================
// REGISTER AGENTS
// ============================================================================

export function initializeAgents() {
    console.log('🤖 Initializing AEGIS Agents...\n');

    // Register Cleaner Agent
    const cleanerAgent = new CleanerAgent();
    agentManager.registerAgent(cleanerAgent);

    // TODO: Register other agents when ready
    // - Sentinel Agent
    // - QA Agent
    // - Security Agent

    console.log('\n✅ Agents registered successfully');
    console.log(`📊 Total agents: ${agentManager.getSummary().total}`);
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demo() {
    console.log('🧪 AEGIS Admin API Demo\n');
    console.log('━'.repeat(60));

    // Initialize agents
    initializeAgents();

    // Get all agents status
    console.log('\n📊 All Agents Status:');
    const agents = agentManager.getAllAgents();
    agents.forEach(agent => {
        console.log(`  - ${agent.name} (${agent.id}): ${agent.status}`);
        console.log(`    Task: ${agent.currentTask}`);
        console.log(`    Last seen: ${agent.lastHeartbeat.toISOString()}`);
    });

    // Get summary
    console.log('\n📈 Summary:');
    const summary = agentManager.getSummary();
    console.log(`  Total: ${summary.total}`);
    console.log(`  Idle: ${summary.idle}`);
    console.log(`  Working: ${summary.working}`);
    console.log(`  Error: ${summary.error}`);

    // Get logs
    console.log('\n📜 Recent Logs:');
    const logs = agentManager.getRecentLogs(5);
    logs.forEach(log => {
        const emoji = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : log.type === 'success' ? '✅' : 'ℹ️';
        console.log(`  ${emoji} [${log.agentName}] ${log.message}`);
    });

    console.log('\n━'.repeat(60));
    console.log('✅ Demo complete');
    console.log('\n💡 To test the API:');
    console.log('  GET http://localhost:3000/api/admin/agents-status');
    console.log('  GET http://localhost:3000/api/admin/logs');
}

// Run demo if executed directly
if (require.main === module) {
    demo().catch(console.error);
}

export { demo };
