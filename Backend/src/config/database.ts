// ============================================================
// Prisma Database Client Singleton
// Ensures a single PrismaClient instance across the app
// ============================================================

import { PrismaClient } from "@prisma/client";

// Extend globalThis to cache PrismaClient in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton PrismaClient instance.
 * In development, it's cached on globalThis to avoid
 * multiple instances during hot-reloading.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}