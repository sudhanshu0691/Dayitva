"use strict";
// ============================================================
// User Validation Schemas (Zod)
// Validates profile updates, KYC verification
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisputeSchema = exports.kycVerificationSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for updating user profile.
 */
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    mobile: zod_1.z.string().min(10).optional(),
    // Vendor fields
    companyName: zod_1.z.string().optional(),
    regNumber: zod_1.z.string().optional(),
    pan: zod_1.z.string().optional(),
    gst: zod_1.z.string().optional(),
    turnover: zod_1.z.string().optional(),
    itrYears: zod_1.z.array(zod_1.z.string()).optional(),
    // Officer fields
    designation: zod_1.z.string().optional(),
    ministry: zod_1.z.string().optional(),
    ministryCode: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * Schema for KYC verification (Officer action).
 */
exports.kycVerificationSchema = zod_1.z.object({
    status: zod_1.z.enum(["Approved", "Rejected", "UnderReview"]),
    feedback: zod_1.z.string().optional(),
});
/**
 * Schema for creating a dispute.
 */
exports.createDisputeSchema = zod_1.z.object({
    tenderId: zod_1.z.string().min(1, "Tender ID is required"),
    text: zod_1.z.string().min(10, "Dispute text must be at least 10 characters").max(2000),
});
//# sourceMappingURL=user.validator.js.map