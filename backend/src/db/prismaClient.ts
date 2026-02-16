import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Use the same DATABASE_URL you're already using for Prisma
const databaseUrl = process.env.DATABASE_URL;

console.log('[prisma] DATABASE_URL raw:', databaseUrl);

// Optional: log a redacted version (hide password)
if (databaseUrl) {
  const redacted = databaseUrl.replace(/:(.*?)@/, ':****@');
  console.log('[prisma] DATABASE_URL redacted:', redacted);
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set – check your .env file');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // required for Supabase from Node
  },
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}