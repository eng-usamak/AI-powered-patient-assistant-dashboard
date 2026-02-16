import { Router } from 'express';

export const router = Router();

// Example placeholder for GET /api/patients
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});
