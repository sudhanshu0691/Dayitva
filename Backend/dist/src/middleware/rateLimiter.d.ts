/**
 * General API rate limiter.
 * Limits all requests to 100 per 15 minutes per IP.
 */
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for auth endpoints.
 * Limits to 10 requests per 15 minutes per IP to prevent brute force.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for bid submission.
 * Limits to 5 requests per hour per IP.
 */
export declare const bidLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for tender creation.
 * Limits to 10 requests per hour per IP.
 */
export declare const tenderLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map