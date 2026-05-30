"use strict";
// ============================================================
// Tender Validation Schemas (Zod)
// Validates tender creation and query parameters
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenderQuerySchema = exports.updateTenderSchema = exports.createTenderSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for creating a new tender.
 */
exports.createTenderSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, "Title must be at least 5 characters").max(200),
    description: zod_1.z.string().min(20, "Description must be at least 20 characters").max(5000),
    ministry: zod_1.z.string().min(2, "Ministry name is required"),
    budget: zod_1.z.number().positive("Budget must be a positive number"),
    deadline: zod_1.z.string().datetime("Deadline must be a valid ISO date"),
    msmeQuota: zod_1.z.boolean().default(false),
    criteria: zod_1.z.array(zod_1.z.string()).min(1, "At least one evaluation criterion is required"),
    ipfsHash: zod_1.z.string().optional(),
    ipfsFiles: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        size: zod_1.z.string(),
        hash: zod_1.z.string(),
        uploadedAt: zod_1.z.string(),
    })).optional(),
    minScore: zod_1.z.number().min(0).max(100).optional().default(0),
});
/**
 * Schema for updating a tender.
 */
exports.updateTenderSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(200).optional(),
    description: zod_1.z.string().min(20).max(5000).optional(),
    budget: zod_1.z.number().positive().optional(),
    deadline: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(["Draft", "Open", "Closed", "UnderEvaluation", "Awarded", "Cancelled"]).optional(),
    msmeQuota: zod_1.z.boolean().optional(),
    criteria: zod_1.z.array(zod_1.z.string()).optional(),
    ipfsHash: zod_1.z.string().optional(),
    minScore: zod_1.z.number().min(0).max(100).optional(),
});
/**
 * Schema for tender query parameters (filtering, pagination).
 */
exports.tenderQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["Draft", "Open", "Closed", "UnderEvaluation", "Awarded", "Cancelled"]).optional(),
    ministry: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
    sortBy: zod_1.z.enum(["createdAt", "budget", "deadline", "title"]).optional().default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
});
//# sourceMappingURL=tender.validator.js.map