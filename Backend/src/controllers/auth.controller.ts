// ============================================================
// Authentication Controller
// Handles HTTP request/response for auth endpoints
// ============================================================

import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

/**
 * POST /api/auth/register
 * Register a new user (officer or vendor).
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerUser(req.body);

    logger.info(`User registered: ${result.user.email} (role: ${result.user.role})`);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Login with email and password.
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.loginWithCredentials(req.body);

    logger.info(`User logged in: ${result.user.email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/nonce
 * Generate a nonce for MetaMask wallet signature.
 */
export async function requestNonce(req: Request, res: Response, next: NextFunction) {
  try {
    const { walletAddress } = req.body;
    const result = await authService.generateNonce(walletAddress);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/metamask
 * Login with MetaMask wallet signature.
 */
export async function metamaskLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { walletAddress, signature } = req.body;
    const result = await authService.loginWithMetaMask(walletAddress, signature);

    logger.info(`MetaMask login: ${result.user.email} (wallet: ${walletAddress})`);

    res.status(200).json({
      success: true,
      message: "MetaMask authentication successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Refresh an expired access token.
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Logout user by revoking refresh tokens.
 */
export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logoutUser(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}