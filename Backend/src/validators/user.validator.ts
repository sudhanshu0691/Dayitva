// ============================================================
// User Validation Schemas (Zod)
// Validates profile updates, KYC verification
// ============================================================

import { z } from "zod";

/**
 * Schema for updating user profile.
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  mobile: z.string().min(10).optional(),
  // Vendor fields
  companyName: z.string().optional(),
  regNumber: z.string().optional(),
  pan: z.string().optional(),
  gst: z.string().optional(),
  turnover: z.string().optional(),
  itrYears: z.array(z.string()).optional(),
  // Officer fields
  designation: z.string().optional(),
  ministry: z.string().optional(),
  ministryCode: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Schema for KYC verification (Officer action).
 */
export const kycVerificationSchema = z.object({
  status: z.enum(["Approved", "Rejected", "UnderReview"]),
  feedback: z.string().optional(),
});

/**
 * Schema for creating a dispute.
 */
export const createDisputeSchema = z.object({
  tenderId: z.string().min(1, "Tender ID is required"),
  text: z.string().min(10, "Dispute text must be at least 10 characters").max(2000),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type KYCVerificationInput = z.infer<typeof kycVerificationSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;