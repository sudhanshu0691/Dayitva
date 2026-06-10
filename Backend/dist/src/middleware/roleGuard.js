"use strict";
// ============================================================
// Role-Based Access Control Middleware
// Restricts routes to specific user roles
// Updated: Uses independent Vendor and Officer models
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.isOfficer = isOfficer;
exports.isVendor = isVendor;
exports.requireKYC = requireKYC;
exports.requireOfficerKYC = requireOfficerKYC;
const errorHandler_1 = require("./errorHandler");
const database_1 = require("../config/database");
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
 * Find user by ID in either Vendor or Officer table (for KYC check)
 */
async function findUserForKYC(userId) {
    const vendor = await database_1.prisma.vendor.findUnique({
        where: { id: userId },
        select: { id: true, kycStatus: true, role: true },
    });
    if (vendor)
        return vendor;
    const officer = await database_1.prisma.officer.findUnique({
        where: { id: userId },
        select: { id: true, kycStatus: true, role: true },
    });
    return officer;
}
/**
 * KYC Guard: Ensures user has approved KYC before accessing routes.
 * Use on routes that require KYC verification (create tender, place bid).
 */
async function requireKYC(req, _res, next) {
    try {
        const userId = req.user.userId;
        const user = await findUserForKYC(userId);
        if (!user) {
            throw new errorHandler_1.AppError("User not found", 404);
        }
        if (user.kycStatus !== "Approved") {
            throw new errorHandler_1.AppError(`KYC verification required. Your KYC status is "${user.kycStatus}". Please complete KYC verification first.`, 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            next(error);
        }
        else {
            next(new errorHandler_1.AppError("KYC verification check failed", 500));
        }
    }
}
/**
 * Officer KYC Guard: Ensures user is an officer with approved KYC.
 * Use on tender creation routes.
 */
async function requireOfficerKYC(req, _res, next) {
    try {
        const userId = req.user.userId;
        const user = await findUserForKYC(userId);
        if (!user) {
            throw new errorHandler_1.AppError("User not found", 404);
        }
        if (user.role !== "officer") {
            throw new errorHandler_1.AppError("Only officers can perform this action", 403);
        }
        if (user.kycStatus !== "Approved") {
            throw new errorHandler_1.AppError(`Officer KYC not approved (status: ${user.kycStatus}). Complete KYC to create tenders.`, 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            next(error);
        }
        else {
            next(new errorHandler_1.AppError("KYC verification check failed", 500));
        }
    }
}
//# sourceMappingURL=roleGuard.js.map