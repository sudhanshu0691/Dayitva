// ============================================================
// Rate Limiting Middleware
// Protects API from abuse using express-rate-limit
// ============================================================

import rateLimit from "express-rate-limit";

/**
 * General API rate limiter.
 * Limits all requests to 100 per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
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
export const authLimiter = rateLimit({
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
export const bidLimiter = rateLimit({
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
export const tenderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many tender creation attempts. Please try again later.",
  },
});