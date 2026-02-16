import { Response, NextFunction } from 'express';
import { prisma } from '../db/prismaClient';
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';

export async function register(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required' } });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: { message: 'Email already in use' } });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required' } });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
}
