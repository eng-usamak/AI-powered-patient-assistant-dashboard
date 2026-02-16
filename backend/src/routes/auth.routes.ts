import { Router } from 'express';

export const router = Router();

// Placeholder routes; real handlers come later
router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});
