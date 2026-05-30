"use strict";
// ============================================================
// Prisma Database Client Singleton
// Ensures a single PrismaClient instance across the app
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Extend globalThis to cache PrismaClient in development
const globalForPrisma = globalThis;
/**
 * Singleton PrismaClient instance.
 * In development, it's cached on globalThis to avoid
 * multiple instances during hot-reloading.
 */
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
//# sourceMappingURL=database.js.map