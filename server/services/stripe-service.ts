
import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export class StripeService {
    static async createCustomer(email: string, userId: string) {
        return stripe.customers.create({
            email,
            metadata: {
                userId,
            },
        });
    }

    static async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
        return stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
    }

    static async createPortalSession(customerId: string, returnUrl: string) {
        return stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }

    static constructEvent(payload: string | Buffer, signature: string) {
        return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    }
}
