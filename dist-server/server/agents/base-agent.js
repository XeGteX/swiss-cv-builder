import { LoggerService } from '../services/logger-service';
export class BaseAgent {
    /**
     * Main entry point for the agent.
     */
    async run() {
        LoggerService.info(`🤖 [${this.name}] Starting cycle...`);
        try {
            const analysis = await this.analyze();
            await this.execute(analysis);
            LoggerService.info(`✅ [${this.name}] Cycle complete.`);
        }
        catch (error) {
            LoggerService.error(`❌ [${this.name}] Failed: ${error.message}`);
        }
    }
}
