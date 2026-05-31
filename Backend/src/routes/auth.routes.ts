// ============================================================
// Authentication Routes
// POST /api/auth/*
// ============================================================

import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import {
  registerSchema,
  loginSchema,
  nonceRequestSchema,
  metamaskLoginSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 * Register a new user (officer or vendor).
 * Body: { name, email, password, role, ... }
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * POST /api/auth/login
 * Login with email and password.
 * Body: { email, password }
 */
router.post("/login", validate(loginSchema), authController.login);

/**
 * POST /api/auth/nonce
 * Get a nonce for MetaMask signature.
 * Body: { walletAddress }
 */
router.post("/nonce", validate(nonceRequestSchema), authController.requestNonce);

/**
 * POST /api/auth/metamask
 * Login with MetaMask wallet signature.
 * Body: { walletAddress, signature }
 */
router.post("/metamask", validate(metamaskLoginSchema), authController.metamaskLogin);

/**
 * POST /api/auth/refresh
 * Refresh an expired access token.
 * Body: { refreshToken }
 */
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);

/**
 * POST /api/auth/logout
 * Logout (revoke refresh tokens). Requires authentication.
 */
router.post("/logout", authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Get current user profile. Requires authentication.
 */
router.get("/me", authenticate, authController.getMe);

// ============================================================
// OTP & Email Verification Routes
// ============================================================

/**
 * POST /api/auth/send-otp
 * Send OTP to email for verification.
 * Body: { email, type?: "VERIFY_EMAIL" | "FORGOT_PASSWORD" }
 */
router.post("/send-otp", validate(sendOtpSchema), authController.sendOtpHandler);

/**
 * POST /api/auth/verify-otp
 * Verify OTP code.
 * Body: { email, otp, type?: "VERIFY_EMAIL" | "FORGOT_PASSWORD" }
 */
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtpHandler);

/**
 * POST /api/auth/resend-otp
 * Resend OTP with 30s cooldown.
 * Body: { email, type?: "VERIFY_EMAIL" | "FORGOT_PASSWORD" }
 */
router.post("/resend-otp", validate(sendOtpSchema), authController.resendOtpHandler);

/**
 * POST /api/auth/forgot-password
 * Send password reset OTP to email.
 * Body: { email }
 */
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPasswordHandler);

/**
 * POST /api/auth/reset-password
 * Reset password using OTP.
 * Body: { email, otp, newPassword }
 */
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPasswordHandler);

export default router;
