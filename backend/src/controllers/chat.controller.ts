import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getChatHistory,
  createChatMessageWithAiReply,
} from '../services/chat.service';

export async function handleGetChatHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const patientId = Number(req.params.patientId);
    if (Number.isNaN(patientId)) {
      return res.status(400).json({ error: { message: 'Invalid patient id' } });
    }

    const messages = await getChatHistory(patientId);
    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
}

export async function handlePostChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { patientId, message } = req.body as {
      patientId?: number;
      message?: string;
    };

    if (!patientId || !message) {
      return res
        .status(400)
        .json({ error: { message: 'patientId and message are required' } });
    }

    const { userMsg, aiMsg } = await createChatMessageWithAiReply(
      Number(patientId),
      message
    );

    res.status(201).json({
      data: {
        userMessage: userMsg,
        aiMessage: aiMsg,
      },
    });
  } catch (err: any) {
    if (err.status === 404) {
      return res.status(404).json({ error: { message: 'Patient not found' } });
    }
    next(err);
  }
}
