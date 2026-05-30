"use strict";
// ============================================================
// Authentication Controller
// Handles HTTP request/response for auth endpoints
// ============================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.requestNonce = requestNonce;
exports.metamaskLogin = metamaskLogin;
exports.refresh = refresh;
exports.logout = logout;
exports.getMe = getMe;
const authService = __importStar(require("../services/auth.service"));
const logger_1 = require("../utils/logger");
/**
 * POST /api/auth/register
 * Register a new user (officer or vendor).
 */
async function register(req, res, next) {
    try {
        const result = await authService.registerUser(req.body);
        logger_1.logger.info(`User registered: ${result.user.email} (role: ${result.user.role})`);
        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/auth/login
 * Login with email and password.
 */
async function login(req, res, next) {
    try {
        const result = await authService.loginWithCredentials(req.body);
        logger_1.logger.info(`User logged in: ${result.user.email}`);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/auth/nonce
 * Generate a nonce for MetaMask wallet signature.
 */
async function requestNonce(req, res, next) {
    try {
        const { walletAddress } = req.body;
        const result = await authService.generateNonce(walletAddress);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/auth/metamask
 * Login with MetaMask wallet signature.
 */
async function metamaskLogin(req, res, next) {
    try {
        const { walletAddress, signature } = req.body;
        const result = await authService.loginWithMetaMask(walletAddress, signature);
        logger_1.logger.info(`MetaMask login: ${result.user.email} (wallet: ${walletAddress})`);
        res.status(200).json({
            success: true,
            message: "MetaMask authentication successful",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/auth/refresh
 * Refresh an expired access token.
 */
async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({
            success: true,
            data: tokens,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/auth/logout
 * Logout user by revoking refresh tokens.
 */
async function logout(req, res, next) {
    try {
        await authService.logoutUser(req.user.userId);
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
async function getMe(req, res, next) {
    try {
        const user = await authService.getCurrentUser(req.user.userId);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map