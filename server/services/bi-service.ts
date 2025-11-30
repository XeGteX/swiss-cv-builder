
import prisma from '../prisma';
import { LoggerService } from './logger-service';

export class BIService {
    /**
     * Analyzes user activity to identify churn risks.
     * Churn Risk = Created account > 7 days ago AND No CV updates in last 7 days AND Subscription is FREE.
     */
    static async identifyChurnRisks() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const atRiskUsers = await prisma.user.findMany({
            where: {
                createdAt: { lt: sevenDaysAgo },
                subscriptionStatus: 'FREE',
                // In a real app, we would check 'lastActive' or 'updatedAt' on CVs
                // For now, we assume all FREE users older than 7 days are at risk for demo
            },
            take: 10 // Limit batch size
        });

        return atRiskUsers;
    }

    /**
     * Generates retention offers for at-risk users.
     */
    static async generateRetentionOffers() {
        const atRiskUsers = await this.identifyChurnRisks();

        const offers = atRiskUsers.map(user => ({
            userId: user.id,
            email: user.email,
            offer: 'RETENTION_20',
            discount: '20%',
            reason: 'Inactive for 7+ days'
        }));

        if (offers.length > 0) {
            LoggerService.info(`📉 BI Analysis: Identified ${offers.length} users at risk of churn.`);
            LoggerService.info('🎁 Generating Retention Offers...', offers);
        } else {
            LoggerService.info('📈 BI Analysis: User retention looks healthy.');
        }

        return offers;
    }

    /**
     * Calculates projected revenue based on current subscriptions.
     */
    static async calculateProjectedRevenue() {
        const proCount = await prisma.subscription.count({
            where: { status: 'active', plan: 'PRO' }
        });

        const mrr = proCount * 9.99; // Assuming $9.99/mo
        return {
            proUsers: proCount,
            mrr: mrr,
            arr: mrr * 12
        };
    }
}
