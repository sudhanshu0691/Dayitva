"use strict";
// ============================================================
// JWT Authentication Middleware
// Verifies Bearer token from Authorization header
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("./errorHandler");
/**
 * Authentication middleware.
 * Extracts and verifies JWT Bearer token from Authorization header.
 * Attaches decoded user payload to request.user.
 */
function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.AppError("Authentication required. No token provided.", 401);
        }
        // Expect "Bearer <token>"
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            throw new errorHandler_1.AppError("Invalid authorization header format. Use: Bearer <token>", 401);
        }
        const token = parts[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            walletAddress: decoded.walletAddress,
        };
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            next(error);
        }
        else {
            next(new errorHandler_1.AppError("Invalid or expired token", 401));
        }
    }
}
/**
 * Optional authentication middleware.
 * Attaches user info if token is present, but doesn't fail if missing.
 */
function optionalAuth(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const parts = authHeader.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                const decoded = (0, jwt_1.verifyAccessToken)(parts[1]);
                req.user = {
                    userId: decoded.userId,
                    role: decoded.role,
                    walletAddress: decoded.walletAddress,
                };
            }
        }
    }
    catch {
        // Silently ignore invalid tokens for optional auth
    }
    next();
}
//# sourceMappingURL=auth.js.map