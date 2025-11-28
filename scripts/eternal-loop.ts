import { SecurityAgent } from '../server/agents/security-agent';
import { CodeRefactorAgent } from '../server/agents/code-refactor-agent';
import { LoggerService } from '../server/services/logger-service';

async function main() {
    LoggerService.info('♾️  [ETERNAL LOOP] Initiating System Cycle...');

    const agents = [
        new SecurityAgent(),
        new CodeRefactorAgent(),
        // new PerformanceAgent(),
        // new BusinessAgent()
    ];

    for (const agent of agents) {
        await agent.run();
    }

    LoggerService.info('✅ [ETERNAL LOOP] Cycle Complete. Resting...');
}

main().catch(console.error);
