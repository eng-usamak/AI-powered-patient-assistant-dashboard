import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || '4000';

export const config = {
  port: Number(PORT),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-prod'
};