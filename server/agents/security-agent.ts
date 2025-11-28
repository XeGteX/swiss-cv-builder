import { BaseAgent } from './base-agent';
import { LoggerService } from '../services/logger-service';
import { env } from '../config/env';

export class SecurityAgent extends BaseAgent {
    name = 'SecurityAgent';

    async analyze() {
        const risks = [];

        // Check 1: Environment Variables
        if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
            risks.push('Weak JWT_SECRET detected.');
        }

        // Check 2: Production Mode
        if (process.env.NODE_ENV !== 'production') {
            risks.push('Running in non-production mode (Acceptable for Dev).');
        }

        // Check 3: Headers (Mock check)
        // In a real agent, we would make a request to localhost and check headers
        const missingHeaders = []; // Mock
        if (missingHeaders.length > 0) {
            risks.push(`Missing security headers: ${missingHeaders.join(', ')}`);
        }

        return risks;
    }

    async execute(risks: string[]) {
        if (risks.length === 0) {
            LoggerService.info(`🛡️ [${this.name}] System is secure.`);
            return;
        }

        LoggerService.warn(`⚠️ [${this.name}] Identified ${risks.length} risks:`);
        risks.forEach(risk => LoggerService.warn(`   - ${risk}`));

        // Auto-Fix Logic (Simulated)
        if (risks.includes('Weak JWT_SECRET detected.')) {
            LoggerService.info(`🔧 [${this.name}] Recommendation: Rotate JWT_SECRET immediately.`);
        }
    }
}
