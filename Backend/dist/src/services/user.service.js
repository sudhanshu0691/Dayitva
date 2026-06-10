"use strict";
// ============================================================
// User Service
// Handles user profile, KYC verification
// Updated: Uses independent Vendor and Officer models
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
 * Find a user profile by ID in either Vendor or Officer table
 */
async function findUserById(userId) {
    const vendor = await database_1.prisma.vendor.findUnique({ where: { id: userId } });
    if (vendor)
        return { ...vendor, __model: "vendor" };
    const officer = await database_1.prisma.officer.findUnique({ where: { id: userId } });
    if (officer)
        return { ...officer, __model: "officer" };
    return null;
}
/**
 * Update a user by ID in appropriate table
 */
async function updateUserById(userId, data, model) {
    if (model === "vendor") {
        return database_1.prisma.vendor.update({ where: { id: userId }, data });
    }
    return database_1.prisma.officer.update({ where: { id: userId }, data });
}
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
    const user = await findUserById(userId);
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
    const updated = await updateUserById(userId, updateData, user.__model);
    return formatUser(updated);
}
/**
 * KYC verification - ONLY AUDITOR can do this.
 * @deprecated Use auditorService.approveUser() or auditorService.rejectUser()
 */
async function verifyKYC(vendorId, input, officerId) {
    throw new errorHandler_1.AppError("KYC verification can only be performed by Auditor. Contact auditor.", 403);
}
/**
 * Get user by ID
 */
async function getUserById(userId) {
    const user = await findUserById(userId);
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    return formatUser(user);
}
/**
 * Get KYC status
 */
async function getKYCStatus(userId) {
    const vendor = await database_1.prisma.vendor.findUnique({
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
    if (vendor)
        return vendor;
    const officer = await database_1.prisma.officer.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            kycStatus: true,
            designation: true,
            ministry: true,
        },
    });
    if (officer)
        return officer;
    throw new errorHandler_1.AppError("User not found", 404);
}
/**
 * Submit KYC documents (supports both vendors and officers)
 */
async function submitKYC(userId, kycData) {
    const user = await findUserById(userId);
    if (!user)
        throw new errorHandler_1.AppError("User not found", 404);
    if (user.role !== "vendor" && user.role !== "officer")
        throw new errorHandler_1.AppError("Invalid user role for KYC", 403);
    const updateData = {
        kycStatus: "UnderReview",
    };
    // Only include vendor-specific fields if the user is a vendor
    if (user.__model === "vendor") {
        if (kycData.pan !== undefined)
            updateData.pan = kycData.pan;
        if (kycData.gst !== undefined)
            updateData.gst = kycData.gst;
        if (kycData.solvencyCertificate !== undefined)
            updateData.solvencyCertificate = kycData.solvencyCertificate;
        if (kycData.regNumber !== undefined)
            updateData.regNumber = kycData.regNumber;
        if (kycData.companyName !== undefined)
            updateData.companyName = kycData.companyName;
        if (kycData.turnover !== undefined)
            updateData.turnover = kycData.turnover;
        if (kycData.itrYears !== undefined)
            updateData.itrYears = JSON.stringify(kycData.itrYears);
        if (kycData.experienceScore !== undefined)
            updateData.experienceScore = kycData.experienceScore;
    }
    // Only include officer-specific fields if the user is an officer
    if (user.__model === "officer") {
        if (kycData.designation !== undefined)
            updateData.designation = kycData.designation;
        if (kycData.ministry !== undefined)
            updateData.ministry = kycData.ministry;
        if (kycData.ministryCode !== undefined)
            updateData.ministryCode = kycData.ministryCode;
    }
    const updatedUser = await updateUserById(userId, updateData, user.__model);
    // Notify the user
    let notificationData = {
        title: "KYC Submission Received",
        message: "Your KYC documents have been submitted for auditor verification",
        category: "kyc",
    };
    if (user.__model === "vendor") {
        notificationData.vendorId = userId;
    }
    else {
        notificationData.officerId = userId;
    }
    await database_1.prisma.notification.create({ data: notificationData });
    // Notify all auditors about new KYC submission
    const auditors = await database_1.prisma.auditor.findMany({ select: { id: true } });
    for (const auditor of auditors) {
        await database_1.prisma.auditorNotification.create({
            data: {
                auditorId: auditor.id,
                title: "New KYC Submission",
                message: `${user.role === "vendor" ? "Vendor" : "Officer"} ${user.name} (${user.email}) has submitted KYC documents for verification.`,
                type: "new_verification",
                actionUrl: `/${user.role === "vendor" ? "vendors" : "officers"}`,
            },
        });
    }
    return formatUser(updatedUser);
}
/**
 * Get pending KYC applications
 */
async function getPendingKYC(query) {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const [vendors, vendorTotal] = await Promise.all([
        database_1.prisma.vendor.findMany({
            where: {
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
        database_1.prisma.vendor.count({
            where: {
                kycStatus: {
                    in: ["Pending", "UnderReview"],
                },
            },
        }),
    ]);
    // Also get pending officers
    const [officers, officerTotal] = await Promise.all([
        database_1.prisma.officer.findMany({
            where: {
                kycStatus: {
                    in: ["Pending", "UnderReview"],
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                designation: true,
                ministry: true,
                kycStatus: true,
                createdAt: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.officer.count({
            where: {
                kycStatus: {
                    in: ["Pending", "UnderReview"],
                },
            },
        }),
    ]);
    return {
        data: { vendors, officers },
        pagination: {
            page,
            limit,
            total: vendorTotal + officerTotal,
            pages: Math.ceil((vendorTotal + officerTotal) / limit),
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
    let vendors = [];
    let officers = [];
    let vendorTotal = 0;
    let officerTotal = 0;
    if (!role || role === "vendor") {
        const vendorWhere = {};
        if (kycStatus)
            vendorWhere.kycStatus = kycStatus;
        [vendors, vendorTotal] = await Promise.all([
            database_1.prisma.vendor.findMany({
                where: vendorWhere,
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
            database_1.prisma.vendor.count({ where: vendorWhere }),
        ]);
    }
    if (!role || role === "officer") {
        const officerWhere = {};
        if (kycStatus)
            officerWhere.kycStatus = kycStatus;
        [officers, officerTotal] = await Promise.all([
            database_1.prisma.officer.findMany({
                where: officerWhere,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    mobile: true,
                    role: true,
                    kycStatus: true,
                    designation: true,
                    createdAt: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            database_1.prisma.officer.count({ where: officerWhere }),
        ]);
    }
    const users = [...vendors, ...officers].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = vendorTotal + officerTotal;
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
    const vendor = await database_1.prisma.vendor.findUnique({ where: { id: userId } });
    if (vendor) {
        await database_1.prisma.vendor.delete({ where: { id: userId } });
        return;
    }
    const officer = await database_1.prisma.officer.findUnique({ where: { id: userId } });
    if (officer) {
        await database_1.prisma.officer.delete({ where: { id: userId } });
        return;
    }
    throw new errorHandler_1.AppError("User not found", 404);
}
//# sourceMappingURL=user.service.js.map