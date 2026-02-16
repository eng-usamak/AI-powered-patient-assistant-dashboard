import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

// Apply auth to all /api/patients routes
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});
