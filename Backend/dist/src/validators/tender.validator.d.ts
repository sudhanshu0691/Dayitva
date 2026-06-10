import { z } from "zod";
/**
 * Schema for creating a new tender.
 */
export declare const createTenderSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    ministry: z.ZodString;
    budget: z.ZodNumber;
    deadline: z.ZodString;
    msmeQuota: z.ZodDefault<z.ZodBoolean>;
    criteria: z.ZodArray<z.ZodString, "many">;
    ipfsHash: z.ZodOptional<z.ZodString>;
    ipfsFiles: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        size: z.ZodString;
        hash: z.ZodString;
        uploadedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        size: string;
        hash: string;
        uploadedAt: string;
    }, {
        name: string;
        size: string;
        hash: string;
        uploadedAt: string;
    }>, "many">>;
    minScore: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    budget: number;
    deadline: string;
    ministry: string;
    msmeQuota: boolean;
    criteria: string[];
    minScore: number;
    ipfsHash?: string | undefined;
    ipfsFiles?: {
        name: string;
        size: string;
        hash: string;
        uploadedAt: string;
    }[] | undefined;
}, {
    description: string;
    title: string;
    budget: number;
    deadline: string;
    ministry: string;
    criteria: string[];
    ipfsHash?: string | undefined;
    msmeQuota?: boolean | undefined;
    minScore?: number | undefined;
    ipfsFiles?: {
        name: string;
        size: string;
        hash: string;
        uploadedAt: string;
    }[] | undefined;
}>;
/**
 * Schema for updating a tender.
 */
export declare const updateTenderSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    budget: z.ZodOptional<z.ZodNumber>;
    deadline: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["Draft", "Open", "Closed", "UnderEvaluation", "Awarded", "Cancelled"]>>;
    msmeQuota: z.ZodOptional<z.ZodBoolean>;
    criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ipfsHash: z.ZodOptional<z.ZodString>;
    minScore: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    title?: string | undefined;
    ipfsHash?: string | undefined;
    budget?: number | undefined;
    deadline?: string | undefined;
    status?: "Draft" | "Open" | "Closed" | "UnderEvaluation" | "Awarded" | "Cancelled" | undefined;
    msmeQuota?: boolean | undefined;
    criteria?: string[] | undefined;
    minScore?: number | undefined;
}, {
    description?: string | undefined;
    title?: string | undefined;
    ipfsHash?: string | undefined;
    budget?: number | undefined;
    deadline?: string | undefined;
    status?: "Draft" | "Open" | "Closed" | "UnderEvaluation" | "Awarded" | "Cancelled" | undefined;
    msmeQuota?: boolean | undefined;
    criteria?: string[] | undefined;
    minScore?: number | undefined;
}>;
/**
 * Schema for tender query parameters (filtering, pagination).
 */
export declare const tenderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["Draft", "Open", "Closed", "UnderEvaluation", "Awarded", "Cancelled"]>>;
    ministry: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["createdAt", "budget", "deadline", "title"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "title" | "budget" | "deadline" | "createdAt";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "Draft" | "Open" | "Closed" | "UnderEvaluation" | "Awarded" | "Cancelled" | undefined;
    ministry?: string | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    status?: "Draft" | "Open" | "Closed" | "UnderEvaluation" | "Awarded" | "Cancelled" | undefined;
    ministry?: string | undefined;
    page?: number | undefined;
    sortBy?: "title" | "budget" | "deadline" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type CreateTenderInput = z.infer<typeof createTenderSchema>;
export type UpdateTenderInput = z.infer<typeof updateTenderSchema>;
export type TenderQueryInput = z.infer<typeof tenderQuerySchema>;
//# sourceMappingURL=tender.validator.d.ts.map