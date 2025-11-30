
import express from 'express';
import { AuthController } from '../controllers/auth-controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticateToken, AuthController.me);

export default router;
