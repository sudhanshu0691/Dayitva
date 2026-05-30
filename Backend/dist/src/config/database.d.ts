import { PrismaClient } from "@prisma/client";
/**
 * Singleton PrismaClient instance.
 * In development, it's cached on globalThis to avoid
 * multiple instances during hot-reloading.
 */
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
//# sourceMappingURL=database.d.ts.map