import express from 'express';
import { BIController } from '../controllers/bi-controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Ideally protected by Admin middleware
router.get('/stats', authenticateToken, BIController.getStats);
router.post('/run-analysis', authenticateToken, BIController.runAnalysis);

export default router;
