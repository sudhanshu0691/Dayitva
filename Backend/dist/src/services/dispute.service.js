"use strict";
// ============================================================
// Dispute Service
// Business logic for dispute management
// Updated: Uses Vendor/Officer models and entityId/entityType on Dispute
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
 * Find user in Vendor or Officer table and return enriched dispute info
 */
async function findUserById(userId) {
    const vendor = await database_1.prisma.vendor.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
    });
    if (vendor)
        return vendor;
    const officer = await database_1.prisma.officer.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
    });
    return officer;
}
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
    const user = await findUserById(userId);
    if (!user) {
        throw new errorHandler_1.AppError("User not found", 404);
    }
    const dispute = await database_1.prisma.dispute.create({
        data: {
            tenderId,
            entityId: userId,
            entityType: user.role,
            text,
        },
        include: {
            tender: {
                select: {
                    title: true,
                    ministry: true,
                },
            },
        },
    });
    // Enrich response with user data
    const result = { ...dispute, user };
    // Notify officers about the dispute
    const officers = await database_1.prisma.officer.findMany({
        select: { id: true },
    });
    for (const officer of officers) {
        await database_1.prisma.notification.create({
            data: {
                officerId: officer.id,
                title: "New Dispute Raised",
                message: `A dispute has been raised for tender: ${tender.title}`,
                category: "system",
                actionUrl: `/disputes/${dispute.id}`,
            },
        });
    }
    logger_1.logger.info(`Dispute created: ${dispute.id} for tender: ${tenderId}`);
    return result;
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
        },
    });
    if (!dispute) {
        throw new errorHandler_1.AppError("Dispute not found", 404);
    }
    // Enrich with user data
    let user = null;
    if (dispute.entityId) {
        user = await findUserById(dispute.entityId);
    }
    return { ...dispute, user };
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
        orderBy: { createdAt: "desc" },
    });
    // Enrich with user data
    const enriched = await Promise.all(disputes.map(async (d) => {
        let user = null;
        if (d.entityId) {
            user = await findUserById(d.entityId);
        }
        return { ...d, user };
    }));
    return enriched;
}
/**
 * Update dispute status
 */
async function updateDisputeStatus(disputeId, status, resolution) {
    const dispute = await database_1.prisma.dispute.findUnique({
        where: { id: disputeId },
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
        },
    });
    // Notify the user about dispute status update
    if (dispute.entityId) {
        const notificationData = {
            title: `Dispute ${status}`,
            message: `Your dispute has been ${status.toLowerCase()}. ${resolution ? `Resolution: ${resolution}` : ""}`,
            category: "system",
            actionUrl: `/disputes/${disputeId}`,
        };
        // Try to determine if vendor or officer
        const vendor = await database_1.prisma.vendor.findUnique({ where: { id: dispute.entityId } });
        if (vendor) {
            notificationData.vendorId = dispute.entityId;
        }
        else {
            notificationData.officerId = dispute.entityId;
        }
        await database_1.prisma.notification.create({ data: notificationData });
    }
    // Enrich with user data
    let user = null;
    if (dispute.entityId) {
        user = await findUserById(dispute.entityId);
    }
    logger_1.logger.info(`Dispute ${disputeId} status updated to: ${status}`);
    return { ...updatedDispute, user };
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
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        database_1.prisma.dispute.count({ where: whereClause }),
    ]);
    // Enrich with user data
    const enriched = await Promise.all(disputes.map(async (d) => {
        let user = null;
        if (d.entityId) {
            user = await findUserById(d.entityId);
        }
        return { ...d, user };
    }));
    return {
        data: enriched,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=dispute.service.js.map