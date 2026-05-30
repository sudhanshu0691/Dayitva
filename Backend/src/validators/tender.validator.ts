// ============================================================
// Tender Validation Schemas (Zod)
// Validates tender creation and query parameters
// ============================================================

import { z } from "zod";

/**
 * Schema for creating a new tender.
 */
export const createTenderSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  ministry: z.string().min(2, "Ministry name is required"),
  budget: z.number().positive("Budget must be a positive number"),
  deadline: z.string().datetime("Deadline must be a valid ISO date"),
  msmeQuota: z.boolean().default(false),
  criteria: z.array(z.string()).min(1, "At least one evaluation criterion is required"),
  ipfsHash: z.string().optional(),
  ipfsFiles: z.array(z.object({
    name: z.string(),
    size: z.string(),
    hash: z.string(),
    uploadedAt: z.string(),
  })).optional(),
  minScore: z.number().min(0).max(100).optional().default(0),
});

/**
 * Schema for updating a tender.
 */
export const updateTenderSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  budget: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(["Draft", "Open", "Closed", "UnderEvaluation", "Awarded", "Cancelled"]).optional(),
  msmeQuota: z.boolean().optional(),
  criteria: z.array(z.string()).optional(),
  ipfsHash: z.string().optional(),
  minScore: z.number().min(0).max(100).optional(),
});

/**
 * Schema for tender query parameters (filtering, pagination).
 */
export const tenderQuerySchema = z.object({
  status: z.enum(["Draft", "Open", "Closed", "UnderEvaluation", "Awarded", "Cancelled"]).optional(),
  ministry: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["createdAt", "budget", "deadline", "title"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateTenderInput = z.infer<typeof createTenderSchema>;
export type UpdateTenderInput = z.infer<typeof updateTenderSchema>;
export type TenderQueryInput = z.infer<typeof tenderQuerySchema>;