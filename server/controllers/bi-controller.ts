import { Request, Response, NextFunction } from 'express';
import { BIService } from '../services/bi-service';

export class BIController {
    static async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            // In real app: Check if req.user.role === 'ADMIN'
            const stats = await BIService.calculateProjectedRevenue();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    static async runAnalysis(req: Request, res: Response, next: NextFunction) {
        try {
            const offers = await BIService.generateRetentionOffers();
            res.json({
                message: 'Analysis complete',
                offersGenerated: offers.length,
                details: offers
            });
        } catch (error) {
            next(error);
        }
    }
}
