import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscription-service';
import { LoggerService } from '../services/logger-service';

export class SubscriptionController {
    static async getStatus(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

            const subscription = await SubscriptionService.getSubscription(req.user.id);
            res.json({ subscription });
        } catch (error) {
            next(error);
        }
    }

    static async createCheckout(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.id || !req.user?.email) return res.status(401).json({ error: 'Unauthorized' });

            const session = await SubscriptionService.createCheckoutSession(req.user.id, req.user.email, 'PRO');
            res.json(session);
        } catch (error) {
            next(error);
        }
    }

    static async createPortal(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

            const session = await SubscriptionService.createPortalSession(req.user.id);
            res.json(session);
        } catch (error) {
            next(error);
        }
    }
}
