import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types";
/**
 * POST /api/auth/register
 * Register a new user (officer or vendor).
 */
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/login
 * Login with email and password.
 */
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
/**
 * POST /api/auth/nonce
 * Generate a nonce for MetaMask wallet signature.
 */
export declare function requestNonce(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/metamask
 * Login with MetaMask wallet signature.
 */
export declare function metamaskLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/refresh
 * Refresh an expired access token.
 */
export declare function refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/logout
 * Logout user by revoking refresh tokens.
 */
export declare function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
export declare function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/send-otp
 * Send OTP to user's email for verification.
 */
export declare function sendOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/verify-otp
 * Verify OTP sent to user's email.
 */
export declare function verifyOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/resend-otp
 * Resend OTP with cooldown check.
 */
export declare function resendOtpHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/forgot-password
 * Send password reset OTP to email.
 */
export declare function forgotPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/auth/reset-password
 * Reset password using OTP.
 */
export declare function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map