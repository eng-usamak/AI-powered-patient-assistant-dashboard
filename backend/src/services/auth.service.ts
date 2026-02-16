import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

interface JwtPayload {
  userId: number;
  email: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}