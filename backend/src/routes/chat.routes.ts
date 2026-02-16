import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  handleGetChatHistory,
  handlePostChat,
} from '../controllers/chat.controller';

export const router = Router();

router.use(authMiddleware);

// GET /api/chat/:patientId  → history
router.get('/:patientId', handleGetChatHistory);

// POST /api/chat           → send + get AI reply
router.post('/', handlePostChat);
