"use strict";
// ============================================================
// Auth Validation Schemas (Zod)
// Validates registration, login, nonce requests
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyOtpSchema = exports.sendOtpSchema = exports.refreshTokenSchema = exports.metamaskLoginSchema = exports.nonceRequestSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
/**
 * Registration schema for vendors and officers.
 */
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    mobile: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    role: zod_1.z.enum(["officer", "vendor"]),
    walletAddress: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address").optional(),
    // Vendor-specific
    companyName: zod_1.z.string().optional(),
    regNumber: zod_1.z.string().optional(),
    pan: zod_1.z.string().optional(),
    gst: zod_1.z.string().optional(),
    turnover: zod_1.z.string().optional(),
    itrYears: zod_1.z.array(zod_1.z.string()).optional(),
    // Officer-specific
    designation: zod_1.z.string().optional(),
    ministry: zod_1.z.string().optional(),
    ministryCode: zod_1.z.string().optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
});
/**
 * Login with email and password.
 */
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
/**
 * Request a nonce for MetaMask signature verification.
 */
exports.nonceRequestSchema = zod_1.z.object({
    walletAddress: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
});
/**
 * Login with MetaMask signature.
 */
exports.metamaskLoginSchema = zod_1.z.object({
    walletAddress: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
    signature: zod_1.z.string().min(1, "Signature is required"),
});
/**
 * Refresh token schema.
 */
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token is required"),
});
/**
 * Send OTP schema.
 */
exports.sendOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    type: zod_1.z.enum(["VERIFY_EMAIL", "FORGOT_PASSWORD"]).default("VERIFY_EMAIL"),
});
/**
 * Verify OTP schema.
 */
exports.verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    type: zod_1.z.enum(["VERIFY_EMAIL", "FORGOT_PASSWORD"]).default("VERIFY_EMAIL"),
});
/**
 * Forgot password schema.
 */
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
/**
 * Reset password schema.
 */
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    newPassword: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
//# sourceMappingURL=auth.validator.js.map