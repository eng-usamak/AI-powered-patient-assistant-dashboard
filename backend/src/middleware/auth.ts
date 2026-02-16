import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Invalid token' } });
  }
}
