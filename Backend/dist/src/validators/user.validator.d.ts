import { z } from "zod";
/**
 * Schema for updating user profile.
 */
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    mobile: z.ZodOptional<z.ZodString>;
    companyName: z.ZodOptional<z.ZodString>;
    regNumber: z.ZodOptional<z.ZodString>;
    pan: z.ZodOptional<z.ZodString>;
    gst: z.ZodOptional<z.ZodString>;
    turnover: z.ZodOptional<z.ZodString>;
    itrYears: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    designation: z.ZodOptional<z.ZodString>;
    ministry: z.ZodOptional<z.ZodString>;
    ministryCode: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    mobile?: string | undefined;
    companyName?: string | undefined;
    regNumber?: string | undefined;
    pan?: string | undefined;
    gst?: string | undefined;
    turnover?: string | undefined;
    itrYears?: string[] | undefined;
    designation?: string | undefined;
    ministry?: string | undefined;
    ministryCode?: string | undefined;
    permissions?: string[] | undefined;
}, {
    name?: string | undefined;
    mobile?: string | undefined;
    companyName?: string | undefined;
    regNumber?: string | undefined;
    pan?: string | undefined;
    gst?: string | undefined;
    turnover?: string | undefined;
    itrYears?: string[] | undefined;
    designation?: string | undefined;
    ministry?: string | undefined;
    ministryCode?: string | undefined;
    permissions?: string[] | undefined;
}>;
/**
 * Schema for KYC verification (Officer action).
 */
export declare const kycVerificationSchema: z.ZodObject<{
    status: z.ZodEnum<["Approved", "Rejected", "UnderReview"]>;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "UnderReview" | "Approved" | "Rejected";
    feedback?: string | undefined;
}, {
    status: "UnderReview" | "Approved" | "Rejected";
    feedback?: string | undefined;
}>;
/**
 * Schema for creating a dispute.
 */
export declare const createDisputeSchema: z.ZodObject<{
    tenderId: z.ZodString;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    text: string;
    tenderId: string;
}, {
    text: string;
    tenderId: string;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type KYCVerificationInput = z.infer<typeof kycVerificationSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
//# sourceMappingURL=user.validator.d.ts.map