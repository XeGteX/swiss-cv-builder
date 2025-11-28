import Stripe from 'stripe';


if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is missing. Stripe features will not work.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-11-17.clover' as any, // Cast to any to avoid strict type checking if versions drift
    typescript: true,
});

export default stripe;
