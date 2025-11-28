import { Request, Response } from 'express';
import { StripeService } from '../services/stripe-service';
import prisma from '../prisma';
import { env } from '../config/env';

export class WebhookController {
    static async handleWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'];

        if (!signature) {
            return res.status(400).send('Missing stripe-signature header');
        }

        let event;

        try {
            // Note: req.body must be raw buffer for signature verification
            // We need to ensure the body parser is configured correctly in app.ts
            event = StripeService.constructEvent(req.body, signature as string);
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as any;
                    const subscriptionId = session.subscription;
                    const customerId = session.customer;

                    // Find user by Stripe Customer ID
                    const user = await prisma.subscription.findFirst({
                        where: { stripeCustomerId: customerId },
                        include: { user: true },
                    });

                    if (user) {
                        await prisma.subscription.update({
                            where: { id: user.id },
                            data: {
                                status: 'active',
                                plan: 'PRO',
                                stripeSubscriptionId: subscriptionId,
                                currentPeriodStart: new Date(), // Should ideally come from subscription object
                                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Approx 1 month
                            },
                        });

                        // Update User role/status if needed
                        await prisma.user.update({
                            where: { id: user.userId },
                            data: { subscriptionStatus: 'PRO' }
                        });
                    }
                    break;
                }
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as any;
                    const status = subscription.status;

                    await prisma.subscription.updateMany({
                        where: { stripeSubscriptionId: subscription.id },
                        data: {
                            status: status,
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        },
                    });

                    // If canceled/unpaid, downgrade user
                    if (status !== 'active') {
                        const sub = await prisma.subscription.findFirst({
                            where: { stripeSubscriptionId: subscription.id }
                        });
                        if (sub) {
                            await prisma.user.update({
                                where: { id: sub.userId },
                                data: { subscriptionStatus: 'FREE' }
                            });
                        }
                    }
                    break;
                }
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
