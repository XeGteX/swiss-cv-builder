import express from 'express';
import { SubscriptionController } from '../controllers/subscription-controller';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();
router.get('/status', authenticateToken, SubscriptionController.getStatus);
router.post('/checkout', authenticateToken, SubscriptionController.createCheckout);
router.post('/portal', authenticateToken, SubscriptionController.createPortal);
export default router;
