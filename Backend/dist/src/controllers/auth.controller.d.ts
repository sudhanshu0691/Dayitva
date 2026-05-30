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
export declare function login(req: Request, res: Response, next: NextFunction): Promise<void>;
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
//# sourceMappingURL=auth.controller.d.ts.map