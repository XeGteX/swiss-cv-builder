
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { ProfileController } from '../controllers/profile-controller';

const router = express.Router();

// ATLAS Protocol Permanence - Auto-save (no ID, no auth for V2 testing)
router.put('/', ProfileController.updateCurrent);

// Standard CRUD routes (with auth)
router.get('/', authenticateToken, ProfileController.list);
router.get('/:id', authenticateToken, ProfileController.get);
router.post('/', authenticateToken, ProfileController.create);
router.put('/:id', authenticateToken, ProfileController.update);
router.delete('/:id', authenticateToken, ProfileController.delete);

export default router;
