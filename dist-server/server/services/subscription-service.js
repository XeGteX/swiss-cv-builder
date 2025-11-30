
import prisma from '../prisma';
import { AppError } from '../middleware/error';
import { env } from '../config/env';
import { StripeService } from './stripe-service';
export class SubscriptionService {
    static async getSubscription(userId) {
        return prisma.subscription.findUnique({
            where: { userId },
        });
    }
    static async getOrCreateCustomer(userId, email) {
        let subscription = await prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription) {
            // Create initial subscription record
            subscription = await prisma.subscription.create({
                data: {
                    userId,
                    status: 'incomplete',
                    plan: 'FREE',
                },
            });
        }
        if (!subscription.stripeCustomerId) {
            const customer = await StripeService.createCustomer(email, userId);
            subscription = await prisma.subscription.update({
                where: { userId },
                data: { stripeCustomerId: customer.id },
            });
        }
        return subscription.stripeCustomerId;
    }
    static async createCheckoutSession(userId, email, plan) {
        const customerId = await this.getOrCreateCustomer(userId, email);
        const successUrl = `${env.CORS_ORIGIN}/app?tab=subscription&success=true`;
        const cancelUrl = `${env.CORS_ORIGIN}/app?tab=subscription&canceled=true`;
        const session = await StripeService.createCheckoutSession(customerId, env.STRIPE_PRICE_ID_PRO, successUrl, cancelUrl);
        return { url: session.url };
    }
    static async createPortalSession(userId) {
        const subscription = await prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription?.stripeCustomerId) {
            throw new AppError('No billing account found', 400);
        }
        const returnUrl = `${env.CORS_ORIGIN}/app?tab=subscription`;
        const session = await StripeService.createPortalSession(subscription.stripeCustomerId, returnUrl);
        return { url: session.url };
    }
}
