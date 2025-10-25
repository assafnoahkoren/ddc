import { PrismaClient } from '../_generated/client';

/**
 * Global Prisma client instance
 * Uses singleton pattern to prevent multiple instances
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnect from database
 * Call this when shutting down the application
 */
export async function disconnect() {
  await prisma.$disconnect();
}

/**
 * Connect to database
 * Optional - Prisma connects automatically on first query
 */
export async function connect() {
  await prisma.$connect();
}

// Re-export Prisma types for convenience
export * from '../_generated/client';

// Re-export auth utilities
export * from './auth';

// Re-export integration service
export * from './integrations';
