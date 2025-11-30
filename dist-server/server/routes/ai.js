
import express from 'express';
import { AIController } from '../controllers/ai-controller';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();
router.post('/analyze', authenticateToken, AIController.analyze);
router.post('/generate', authenticateToken, AIController.generate);
export default router;
