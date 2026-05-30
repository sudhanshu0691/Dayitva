"use strict";
// ============================================================
// Bid Validation Schemas (Zod)
// Validates bid submission and reveal requests
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.bidQuerySchema = exports.revealBidSchema = exports.submitBidSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for submitting an encrypted bid (commit phase).
 */
exports.submitBidSchema = zod_1.z.object({
    encryptedBidHash: zod_1.z.string().min(1, "Encrypted bid hash is required"),
    // Optional initial price for tracking (actual price revealed later)
    price: zod_1.z.number().positive().optional(),
});
/**
 * Schema for revealing a bid after deadline (reveal phase).
 */
exports.revealBidSchema = zod_1.z.object({
    price: zod_1.z.number().positive("Price must be a positive number"),
    // Scoring parameters (0-100)
    financialStrength: zod_1.z.number().min(0).max(100),
    pastExperience: zod_1.z.number().min(0).max(100),
    performanceFeedback: zod_1.z.number().min(0).max(100),
    technicalCapability: zod_1.z.number().min(0).max(100),
    compliance: zod_1.z.number().min(0).max(100),
    proposalQuality: zod_1.z.number().min(0).max(100),
});
/**
 * Schema for query parameters for listing bids.
 */
exports.bidQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(50),
    sortBy: zod_1.z.enum(["price", "totalScore", "submittedAt"]).optional().default("submittedAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
});
//# sourceMappingURL=bid.validator.js.map