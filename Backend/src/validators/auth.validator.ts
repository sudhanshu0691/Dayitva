// ============================================================
// Auth Validation Schemas (Zod)
// Validates registration, login, nonce requests
// ============================================================

import { z } from "zod";

/**
 * Registration schema for vendors and officers.
 */
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["officer", "vendor"]),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address").optional(),

  // Vendor-specific
  companyName: z.string().optional(),
  regNumber: z.string().optional(),
  pan: z.string().optional(),
  gst: z.string().optional(),
  turnover: z.string().optional(),
  itrYears: z.array(z.string()).optional(),

  // Officer-specific
  designation: z.string().optional(),
  ministry: z.string().optional(),
  ministryCode: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Login with email and password.
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Request a nonce for MetaMask signature verification.
 */
export const nonceRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
});

/**
 * Login with MetaMask signature.
 */
export const metamaskLoginSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"),
  signature: z.string().min(1, "Signature is required"),
});

/**
 * Refresh token schema.
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Send OTP schema.
 */
export const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.enum(["VERIFY_EMAIL", "FORGOT_PASSWORD"]).default("VERIFY_EMAIL"),
});

/**
 * Verify OTP schema.
 */
export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  type: z.enum(["VERIFY_EMAIL", "FORGOT_PASSWORD"]).default("VERIFY_EMAIL"),
});

/**
 * Forgot password schema.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/**
 * Reset password schema.
 */
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type NonceRequestInput = z.infer<typeof nonceRequestSchema>;
export type MetaMaskLoginInput = z.infer<typeof metamaskLoginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
