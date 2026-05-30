"use strict";
// ============================================================
// User Service
// Handles user profile, KYC verification
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = updateProfile;
exports.verifyKYC = verifyKYC;
exports.getUserById = getUserById;
exports.getKYCStatus = getKYCStatus;
exports.submitKYC = submitKYC;
exports.getPendingKYC = getPendingKYC;
exports.getAllUsers = getAllUsers;
exports.deleteUser = deleteUser;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Format user for API response.
 */
function formatUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile || undefined,
        role: user.role,
        walletAddress: user.walletAddress || undefined,
        kycStatus: user.kycStatus,
        companyName: user.companyName || undefined,
        regNumber: user.regNumber || undefined,
        pan: user.pan || undefined,
        gst: user.gst || undefined,
        turnover: user.turnover || undefined,
        itrYears: user.itrYears ? JSON.parse(user.itrYears) : undefined,
        solvencyCertificate: user.solvencyCertificate || undefined,
        experienceScore: user.experienceScore || undefined,
        designation: user.designation || undefined,
        ministry: user.ministry || undefined,
        ministryCode: user.ministryCode || undefined,
        permissions: user.permissions ? JSON.parse(user.permissions) : undefined,
        deviceInfo: user.deviceInfo || undefined,
        ipAddress: user.ipAddress || undefined,
        createdAt: user.createdAt.toISOString(),
    };
}
/**
 * Update user profile.
 */
async function updateProfile(userId, input) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    const updateData = {};
    if (input.name !== undefined)
        updateData.name = input.name;
    if (input.mobile !== undefined)
        updateData.mobile = input.mobile;
    if (input.companyName !== undefined)
        updateData.companyName = input.companyName;
    if (input.regNumber !== undefined)
        updateData.regNumber = input.regNumber;
    if (input.pan !== undefined)
        updateData.pan = input.pan;
    if (input.gst !== undefined)
        updateData.gst = input.gst;
    if (input.turnover !== undefined)
        updateData.turnover = input.turnover;
    if (input.itrYears !== undefined)
        updateData.itrYears = JSON.stringify(input.itrYears);
    if (input.designation !== undefined)
        updateData.designation = input.designation;
    if (input.ministry !== undefined)
        updateData.ministry = input.ministry;
    if (input.ministryCode !== undefined)
        updateData.ministryCode = input.ministryCode;
    if (input.permissions !== undefined)
        updateData.permissions = JSON.stringify(input.permissions);
    const updated = await database_1.prisma.user.update({
        where: { id: userId },
        data: updateData,
    });
    return formatUser(updated);
}
/**
 * KYC verification (Officer only).
 */
async function verifyKYC(vendorId, input, officerId) {
    const vendor = await database_1.prisma.user.findUnique({ where: { id: vendorId } });
    if (!vendor)
        throw new errorHandler_1.AppError("Vendor not found", 404);
    if (vendor.role !== "vendor")
        throw new errorHandler_1.AppError("User is not a vendor", 400);
    const updated = await database_1.prisma.user.update({
        where: { id: vendorId },
        data: { kycStatus: input.status },
    });
    // Create notification
    await database_1.prisma.notification.create({
        data: {
            title: "KYC Status Update",
            message: `Your KYC has been ${input.status}${input.feedback ? `. Feedback: ${input.feedback}` : ""}`,
            category: "kyc",
            actionUrl: "/vendor/profile",
            userId: vendorId,
        },
    });
    // Create blockchain transaction record
    await database_1.prisma.blockchainTx.create({
        data: {
            txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
            blockNumber: Math.floor(Math.random() * 50000) + 18240000,
            timestamp: new Date(),
            walletAddress: vendor.walletAddress || "",
            type: "KYC_APPROVED",
            status: "success",
            metadata: JSON.stringify({ vendorId, status: input.status, officerId }),
            userId: vendorId,
        },
    });
    return formatUser(updated);
}
/**
 * Get user by ID
 */
async function getUserById(userId) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    return formatUser(user);
}
/**
 * Get KYC status
 */
async function getKYCStatus(userId) {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            kycStatus: true,
            pan: true,
            gst: true,
            solvencyCertificate: true,
        },
    });
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    return user;
}
/**
 * Submit KYC documents
 */
async function submitKYC(userId, kycData) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    if (user.role !== "vendor")
        throw new errorHandler_1.AppError("Only vendors can submit KYC", 403);
    const updatedUser = await database_1.prisma.user.update({
        where: { id: userId },
        data: {
            pan: kycData.pan,
            gst: kycData.gst,
            solvencyCertificate: kycData.solvencyCertificate,
            regNumber: kycData.regNumber,
            companyName: kycData.companyName,
            kycStatus: "UnderReview",
        },
    });
    await database_1.prisma.notification.create({
        data: {
            userId: userId,
            title: "KYC Submission Received",
            message: "Your KYC documents have been submitted for verification",
            category: "kyc",
        },
    });
    return formatUser(updatedUser);
}
/**
 * Get pending KYC applications
 */
async function getPendingKYC(query) {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        database_1.prisma.user.findMany({
            where: {
                role: "vendor",
                kycStatus: {
                    in: ["Pending", "UnderReview"],
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                kycStatus: true,
                createdAt: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.user.count({
            where: {
                role: "vendor",
                kycStatus: {
                    in: ["Pending", "UnderReview"],
                },
            },
        }),
    ]);
    return {
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
/**
 * Get all users (with filters)
 */
async function getAllUsers(query) {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const role = query.role;
    const kycStatus = query.kycStatus;
    const whereClause = {};
    if (role)
        whereClause.role = role;
    if (kycStatus)
        whereClause.kycStatus = kycStatus;
    const [users, total] = await Promise.all([
        database_1.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                mobile: true,
                role: true,
                kycStatus: true,
                companyName: true,
                createdAt: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.user.count({ where: whereClause }),
    ]);
    return {
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
/**
 * Delete user (Admin only)
 */
async function deleteUser(userId) {
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    await database_1.prisma.user.delete({ where: { id: userId } });
}
//# sourceMappingURL=user.service.js.map