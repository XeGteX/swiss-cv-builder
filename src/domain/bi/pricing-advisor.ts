export interface PricingScenario {
    tier: 'FREE' | 'PRO' | 'ELITE';
    currentPrice: number;
    suggestedPrice: number;
    confidence: number;
    reasoning: string;
}

export class PricingAdvisor {
    static analyze(metrics: {
        serverCostPerUser: number;
        conversionRate: number;
        churnRate: number;
        competitorPriceAvg: number;
    }): PricingScenario[] {
        const scenarios: PricingScenario[] = [];

        // PRO Tier Analysis
        const margin = 9.99 - metrics.serverCostPerUser;
        if (margin < 5) {
            scenarios.push({
                tier: 'PRO',
                currentPrice: 9.99,
                suggestedPrice: 12.99,
                confidence: 0.85,
                reasoning: 'Low margin detected. Increase price to sustain growth.'
            });
        } else if (metrics.conversionRate < 0.02) {
            scenarios.push({
                tier: 'PRO',
                currentPrice: 9.99,
                suggestedPrice: 7.99,
                confidence: 0.70,
                reasoning: 'Low conversion rate. Lower price to acquire more users.'
            });
        } else {
            scenarios.push({
                tier: 'PRO',
                currentPrice: 9.99,
                suggestedPrice: 9.99,
                confidence: 0.95,
                reasoning: 'Pricing is optimal based on current metrics.'
            });
        }

        return scenarios;
    }
}
