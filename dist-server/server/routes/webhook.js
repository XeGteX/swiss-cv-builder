import express from 'express';
import { WebhookController } from '../controllers/webhook-controller';
const router = express.Router();
router.post('/', WebhookController.handleWebhook);
export default router;
