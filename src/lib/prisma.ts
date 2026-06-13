/**
 * Prisma Client singleton for Next.js (Prisma 7 + pg adapter)
 *
 * Prisma 7 requires a driver adapter instead of the binary engine.
 * PrismaPg wraps `pg.Pool` and handles the TCP connection to PostgreSQL.
 *
 * The global singleton pattern prevents multiple PrismaClient instances
 * during Next.js hot-reload in development.
 */

import "dotenv/config";
import { PrismaClient } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
