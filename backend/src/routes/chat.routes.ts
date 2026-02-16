import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

export const router = Router();

router.use(authMiddleware);

router.post('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});
