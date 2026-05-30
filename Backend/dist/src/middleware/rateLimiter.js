"use strict";
// ============================================================
// Rate Limiting Middleware
// Protects API from abuse using express-rate-limit
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenderLimiter = exports.bidLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * General API rate limiter.
 * Limits all requests to 100 per 15 minutes per IP.
 */
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});
/**
 * Strict rate limiter for auth endpoints.
 * Limits to 10 requests per 15 minutes per IP to prevent brute force.
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later.",
    },
});
/**
 * Strict rate limiter for bid submission.
 * Limits to 5 requests per hour per IP.
 */
exports.bidLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many bid submissions. Please try again later.",
    },
});
/**
 * Strict rate limiter for tender creation.
 * Limits to 10 requests per hour per IP.
 */
exports.tenderLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many tender creation attempts. Please try again later.",
    },
});
//# sourceMappingURL=rateLimiter.js.map