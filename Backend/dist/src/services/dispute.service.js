"use strict";
// ============================================================
// Dispute Service
// Business logic for dispute management
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDispute = createDispute;
exports.getDisputeById = getDisputeById;
exports.getDisputesByTender = getDisputesByTender;
exports.updateDisputeStatus = updateDisputeStatus;
exports.listDisputes = listDisputes;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
/**
 * Create a new dispute
 */
async function createDispute(tenderId, userId, text, category) {
    // Verify tender exists
    const tender = await database_1.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    // Verify user exists
    const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errorHandler_1.AppError("User not found", 404);
    }
    const dispute = await database_1.prisma.dispute.create({
        data: {
            tenderId,
            userId,
            text,
        },
        include: {
            tender: {
                select: {
                    title: true,
                    ministry: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    // Notify officers about the dispute
    const officers = await database_1.prisma.user.findMany({
        where: { role: "officer" },
        select: { id: true },
    });
    for (const officer of officers) {
        await database_1.prisma.notification.create({
            data: {
                userId: officer.id,
                title: "New Dispute Raised",
                message: `A dispute has been raised for tender: ${tender.title}`,
                category: "system",
                actionUrl: `/disputes/${dispute.id}`,
            },
        });
    }
    logger_1.logger.info(`Dispute created: ${dispute.id} for tender: ${tenderId}`);
    return dispute;
}
/**
 * Get dispute by ID
 */
async function getDisputeById(disputeId) {
    const dispute = await database_1.prisma.dispute.findUnique({
        where: { id: disputeId },
        include: {
            tender: {
                select: {
                    id: true,
                    title: true,
                    ministry: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
    if (!dispute) {
        throw new errorHandler_1.AppError("Dispute not found", 404);
    }
    return dispute;
}
/**
 * Get disputes for a tender
 */
async function getDisputesByTender(tenderId) {
    // Verify tender exists
    const tender = await database_1.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    const disputes = await database_1.prisma.dispute.findMany({
        where: { tenderId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return disputes;
}
/**
 * Update dispute status
 */
async function updateDisputeStatus(disputeId, status, resolution) {
    const dispute = await database_1.prisma.dispute.findUnique({
        where: { id: disputeId },
        include: { user: true },
    });
    if (!dispute) {
        throw new errorHandler_1.AppError("Dispute not found", 404);
    }
    if (!["Open", "UnderReview", "Resolved", "Dismissed"].includes(status)) {
        throw new errorHandler_1.AppError("Invalid dispute status", 400);
    }
    const updatedDispute = await database_1.prisma.dispute.update({
        where: { id: disputeId },
        data: {
            status: status,
            updatedAt: new Date(),
        },
        include: {
            tender: {
                select: {
                    title: true,
                },
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
    // Notify the user about dispute status update
    await database_1.prisma.notification.create({
        data: {
            userId: dispute.userId,
            title: `Dispute ${status}`,
            message: `Your dispute has been ${status.toLowerCase()}. ${resolution ? `Resolution: ${resolution}` : ""}`,
            category: "system",
            actionUrl: `/disputes/${disputeId}`,
        },
    });
    logger_1.logger.info(`Dispute ${disputeId} status updated to: ${status}`);
    return updatedDispute;
}
/**
 * List disputes with filters
 */
async function listDisputes(query) {
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
    const [disputes, total] = await Promise.all([
        database_1.prisma.dispute.findMany({
            where: whereClause,
            include: {
                tender: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.dispute.count({ where: whereClause }),
    ]);
    return {
        data: disputes,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=dispute.service.js.map