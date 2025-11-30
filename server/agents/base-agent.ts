
import { LoggerService } from '../services/logger-service';

export abstract class BaseAgent {
    abstract name: string;

    /**
     * Analyzes the system state relevant to this agent.
     * Returns a report or list of actions.
     */
    abstract analyze(): Promise<any>;

    /**
     * Executes the necessary actions based on the analysis.
     */
    abstract execute(analysisResult: any): Promise<void>;

    /**
     * Main entry point for the agent.
     */
    async run() {
        LoggerService.info(`🤖 [${this.name}] Starting cycle...`);
        try {
            const analysis = await this.analyze();
            await this.execute(analysis);
            LoggerService.info(`✅ [${this.name}] Cycle complete.`);
        } catch (error: any) {
            LoggerService.error(`❌ [${this.name}] Failed: ${error.message}`);
        }
    }
}
