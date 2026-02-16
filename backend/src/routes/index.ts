import { Router } from 'express';
import { router as authRouter } from './auth.routes';
import { router as patientRouter } from './patient.routes';
import { router as chatRouter } from './chat.routes';

export const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes: /api/auth/...
router.use('/auth', authRouter);

// Patient routes: /api/patients/...
router.use('/patients', patientRouter);

// Chat routes: /api/chat/...
router.use('/chat', chatRouter);