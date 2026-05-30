"use strict";
// ============================================================
// Dashboard Service
// Business logic for dashboards and reports
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOfficerDashboard = getOfficerDashboard;
exports.getVendorDashboard = getVendorDashboard;
exports.getAnalytics = getAnalytics;
exports.getTenderReports = getTenderReports;
exports.getBidReports = getBidReports;
exports.getKYCReports = getKYCReports;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get officer dashboard statistics
 */
async function getOfficerDashboard(officerId) {
    const officer = await database_1.prisma.user.findUnique({
        where: { id: officerId },
    });
    if (!officer || officer.role !== "officer") {
        throw new errorHandler_1.AppError("Officer not found", 403);
    }
    // Get statistics
    const [totalTenders, openTenders, closedTenders, totalBids, disputes] = await Promise.all([
        database_1.prisma.tender.count({
            where: { officerId },
        }),
        database_1.prisma.tender.count({
            where: { officerId, status: "Open" },
        }),
        database_1.prisma.tender.count({
            where: { officerId, status: "Closed" },
        }),
        database_1.prisma.bid.count({
            where: {
                tender: { officerId },
            },
        }),
        database_1.prisma.dispute.count({
            where: {
                tender: { officerId },
            },
        }),
    ]);
    // Get recent tenders
    const recentTenders = await database_1.prisma.tender.findMany({
        where: { officerId },
        select: {
            id: true,
            title: true,
            status: true,
            deadline: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    });
    // Get recent bids
    const recentBids = await database_1.prisma.bid.findMany({
        where: {
            tender: { officerId },
        },
        select: {
            id: true,
            tenderId: true,
            vendor: {
                select: {
                    name: true,
                    companyName: true,
                },
            },
            price: true,
            status: true,
            submittedAt: true,
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
    });
    return {
        summary: {
            totalTenders,
            openTenders,
            closedTenders,
            totalBids,
            disputes,
        },
        recentTenders,
        recentBids,
    };
}
/**
 * Get vendor dashboard statistics
 */
async function getVendorDashboard(vendorId) {
    const vendor = await database_1.prisma.user.findUnique({
        where: { id: vendorId },
    });
    if (!vendor || vendor.role !== "vendor") {
        throw new errorHandler_1.AppError("Vendor not found", 403);
    }
    // Get statistics
    const [totalBids, winningBids, activeBids, kycStatus] = await Promise.all([
        database_1.prisma.bid.count({
            where: { vendorId },
        }),
        database_1.prisma.bid.count({
            where: {
                vendorId,
                tender: {
                    status: "Awarded",
                    winnerAddress: vendor.walletAddress,
                },
            },
        }),
        database_1.prisma.bid.count({
            where: {
                vendorId,
                status: "Submitted",
            },
        }),
        database_1.prisma.user.findUnique({
            where: { id: vendorId },
            select: { kycStatus: true },
        }),
    ]);
    // Get recent bids
    const recentBids = await database_1.prisma.bid.findMany({
        where: { vendorId },
        include: {
            tender: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    deadline: true,
                },
            },
        },
        orderBy: { submittedAt: "desc" },
        take: 10,
    });
    // Get available tenders
    const availableTenders = await database_1.prisma.tender.findMany({
        where: {
            status: "Open",
            deadline: {
                gt: new Date(),
            },
        },
        select: {
            id: true,
            title: true,
            budget: true,
            deadline: true,
            ministry: true,
        },
        orderBy: { deadline: "asc" },
        take: 5,
    });
    return {
        summary: {
            totalBids,
            winningBids,
            activeBids,
            kycStatus: kycStatus?.kycStatus || "Pending",
        },
        recentBids,
        availableTenders,
    };
}
/**
 * Get system-wide analytics
 */
async function getAnalytics() {
    const [totalUsers, totalOfficers, totalVendors, totalTenders, totalBids, totalDisputes] = await Promise.all([
        database_1.prisma.user.count(),
        database_1.prisma.user.count({ where: { role: "officer" } }),
        database_1.prisma.user.count({ where: { role: "vendor" } }),
        database_1.prisma.tender.count(),
        database_1.prisma.bid.count(),
        database_1.prisma.dispute.count(),
    ]);
    // Get tender status distribution
    const tenderStatus = await database_1.prisma.tender.groupBy({
        by: ["status"],
        _count: true,
    });
    // Get bid status distribution
    const bidStatus = await database_1.prisma.bid.groupBy({
        by: ["status"],
        _count: true,
    });
    // Get KYC status distribution
    const kycStatus = await database_1.prisma.user.groupBy({
        by: ["kycStatus"],
        _count: true,
    });
    return {
        users: {
            total: totalUsers,
            officers: totalOfficers,
            vendors: totalVendors,
        },
        tenders: {
            total: totalTenders,
            byStatus: tenderStatus.map((s) => ({
                status: s.status,
                count: s._count,
            })),
        },
        bids: {
            total: totalBids,
            byStatus: bidStatus.map((s) => ({
                status: s.status,
                count: s._count,
            })),
        },
        kyc: {
            byStatus: kycStatus.map((s) => ({
                status: s.kycStatus,
                count: s._count,
            })),
        },
        disputes: {
            total: totalDisputes,
        },
    };
}
/**
 * Get tender reports
 */
async function getTenderReports(query) {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const status = query.status;
    const ministry = query.ministry;
    const whereClause = {};
    if (status)
        whereClause.status = status;
    if (ministry)
        whereClause.ministry = ministry;
    const [tenders, total] = await Promise.all([
        database_1.prisma.tender.findMany({
            where: whereClause,
            select: {
                id: true,
                title: true,
                ministry: true,
                budget: true,
                status: true,
                deadline: true,
                createdAt: true,
                _count: {
                    select: { bids: true },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.tender.count({ where: whereClause }),
    ]);
    return {
        data: tenders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
/**
 * Get bid reports
 */
async function getBidReports(query) {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const status = query.status;
    const tenderId = query.tenderId;
    const whereClause = {};
    if (status)
        whereClause.status = status;
    if (tenderId)
        whereClause.tenderId = tenderId;
    const [bids, total] = await Promise.all([
        database_1.prisma.bid.findMany({
            where: whereClause,
            include: {
                tender: {
                    select: {
                        title: true,
                        budget: true,
                    },
                },
                vendor: {
                    select: {
                        name: true,
                        companyName: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { submittedAt: "desc" },
        }),
        database_1.prisma.bid.count({ where: whereClause }),
    ]);
    return {
        data: bids,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
/**
 * Get KYC reports
 */
async function getKYCReports(query) {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const status = query.status || "UnderReview";
    const [users, total] = await Promise.all([
        database_1.prisma.user.findMany({
            where: {
                role: "vendor",
                kycStatus: status,
            },
            select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                pan: true,
                gst: true,
                kycStatus: true,
                createdAt: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "asc" },
        }),
        database_1.prisma.user.count({
            where: {
                role: "vendor",
                kycStatus: status,
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
//# sourceMappingURL=dashboard.service.js.map