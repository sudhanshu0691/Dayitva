"use strict";
// ============================================================
// Role-Based Access Control Middleware
// Restricts routes to specific user roles
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.isOfficer = isOfficer;
exports.isVendor = isVendor;
exports.isPublic = isPublic;
const errorHandler_1 = require("./errorHandler");
/**
 * Role guard middleware factory.
 * Creates middleware that restricts access to specified roles.
 * Must be used AFTER authenticate middleware.
 *
 * @param roles - Allowed roles (e.g., ["officer"], ["vendor"], ["officer", "vendor"])
 * @returns Express middleware
 *
 * Usage:
 *   router.post("/tenders", authenticate, authorize("officer"), createTender);
 *   router.post("/tenders/:id/bids", authenticate, authorize("vendor"), submitBid);
 */
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(new errorHandler_1.AppError("Authentication required", 401));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(new errorHandler_1.AppError(`Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`, 403));
            return;
        }
        next();
    };
}
/**
 * Check if the request user is an officer/administrator.
 */
function isOfficer(req, _res, next) {
    authorize("officer")(req, _res, next);
}
/**
 * Check if the request user is a vendor/bidder.
 */
function isVendor(req, _res, next) {
    authorize("vendor")(req, _res, next);
}
/**
 * Check if the request user is a public/citizen/auditor.
 */
function isPublic(req, _res, next) {
    authorize("public")(req, _res, next);
}
//# sourceMappingURL=roleGuard.js.map