// ============================================================
// Bid Validation Schemas (Zod)
// Validates bid submission and reveal requests
// ============================================================

import { z } from "zod";

/**
 * Schema for submitting an encrypted bid (commit phase).
 */
export const submitBidSchema = z.object({
  encryptedBidHash: z.string().min(1, "Encrypted bid hash is required"),
  // Optional initial price for tracking (actual price revealed later)
  price: z.number().positive().optional(),
});

/**
 * Schema for revealing a bid after deadline (reveal phase).
 */
export const revealBidSchema = z.object({
  price: z.number().positive("Price must be a positive number"),
  // Scoring parameters (0-100)
  financialStrength: z.number().min(0).max(100),
  pastExperience: z.number().min(0).max(100),
  performanceFeedback: z.number().min(0).max(100),
  technicalCapability: z.number().min(0).max(100),
  compliance: z.number().min(0).max(100),
  proposalQuality: z.number().min(0).max(100),
});

/**
 * Schema for query parameters for listing bids.
 */
export const bidQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  sortBy: z.enum(["price", "totalScore", "submittedAt"]).optional().default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type SubmitBidInput = z.infer<typeof submitBidSchema>;
export type RevealBidInput = z.infer<typeof revealBidSchema>;
export type BidQueryInput = z.infer<typeof bidQuerySchema>;