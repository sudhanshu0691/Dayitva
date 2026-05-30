import { z } from "zod";
/**
 * Schema for submitting an encrypted bid (commit phase).
 */
export declare const submitBidSchema: z.ZodObject<{
    encryptedBidHash: z.ZodString;
    price: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    encryptedBidHash: string;
    price?: number | undefined;
}, {
    encryptedBidHash: string;
    price?: number | undefined;
}>;
/**
 * Schema for revealing a bid after deadline (reveal phase).
 */
export declare const revealBidSchema: z.ZodObject<{
    price: z.ZodNumber;
    financialStrength: z.ZodNumber;
    pastExperience: z.ZodNumber;
    performanceFeedback: z.ZodNumber;
    technicalCapability: z.ZodNumber;
    compliance: z.ZodNumber;
    proposalQuality: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    price: number;
    financialStrength: number;
    pastExperience: number;
    performanceFeedback: number;
    technicalCapability: number;
    compliance: number;
    proposalQuality: number;
}, {
    price: number;
    financialStrength: number;
    pastExperience: number;
    performanceFeedback: number;
    technicalCapability: number;
    compliance: number;
    proposalQuality: number;
}>;
/**
 * Schema for query parameters for listing bids.
 */
export declare const bidQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["price", "totalScore", "submittedAt"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "submittedAt" | "price" | "totalScore";
    sortOrder: "asc" | "desc";
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "submittedAt" | "price" | "totalScore" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type SubmitBidInput = z.infer<typeof submitBidSchema>;
export type RevealBidInput = z.infer<typeof revealBidSchema>;
export type BidQueryInput = z.infer<typeof bidQuerySchema>;
//# sourceMappingURL=bid.validator.d.ts.map