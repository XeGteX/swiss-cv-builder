
import Stripe from 'stripe';
import { env } from '../config/env';
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
export class StripeService {
    static async createCustomer(email, userId) {
        return stripe.customers.create({
            email,
            metadata: {
                userId,
            },
        });
    }
    static async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
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
    static async createPortalSession(customerId, returnUrl) {
        return stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }
    static constructEvent(payload, signature) {
        return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    }
}
