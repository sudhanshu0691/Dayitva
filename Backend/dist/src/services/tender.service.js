"use strict";
// ============================================================
// Tender Service
// Handles CRUD operations for tenders
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTender = createTender;
exports.getTenderById = getTenderById;
exports.listTenders = listTenders;
exports.updateTender = updateTender;
exports.updateTenderStatus = updateTenderStatus;
exports.deleteTender = deleteTender;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Format a Prisma tender with bids and audit logs into ITender shape.
 */
function formatTender(tender) {
    const bids = (tender.bids || []).map((b) => formatBid(b));
    const auditTimeline = (tender.auditLogs || []).map((a) => formatAuditLog(a));
    const ipfsFiles = (tender.tenderFiles || []).map((f) => ({
        name: f.name,
        size: f.size,
        hash: f.hash,
        uploadedAt: f.uploadedAt.toISOString(),
    }));
    return {
        id: tender.id,
        title: tender.title,
        description: tender.description,
        ministry: tender.ministry || "",
        budget: tender.budget,
        deadline: tender.deadline.toISOString(),
        status: tender.status,
        msmeQuota: tender.msmeQuota,
        criteria: tender.criteria ? JSON.parse(tender.criteria) : [],
        ipfsHash: tender.ipfsHash || undefined,
        ipfsFiles,
        txHash: tender.txHash || undefined,
        blockNumber: tender.blockNumber || undefined,
        createdAt: tender.createdAt.toISOString(),
        bidsCount: bids.length,
        bids,
        winnerAddress: tender.winnerAddress || undefined,
        winnerPrice: tender.winnerPrice || undefined,
        winnerName: tender.winnerName || undefined,
        auditTimeline,
        isNew: Date.now() - new Date(tender.createdAt).getTime() < 24 * 60 * 60 * 1000,
    };
}
function formatBid(bid) {
    return {
        id: bid.id,
        tenderId: bid.tenderId,
        vendorName: bid.vendor?.name || "Unknown",
        vendorAddress: bid.vendor?.walletAddress || "",
        price: bid.price || undefined,
        isEncrypted: bid.status === "Submitted",
        submittedAt: bid.submittedAt.toISOString(),
        txHash: bid.txHash || undefined,
        blockNumber: bid.blockNumber || undefined,
        priceScore: bid.priceScore || undefined,
        financialStrength: bid.financialStrength || undefined,
        pastExperience: bid.pastExperience || undefined,
        performanceFeedback: bid.performanceFeedback || undefined,
        technicalCapability: bid.technicalCapability || undefined,
        compliance: bid.compliance || undefined,
        proposalQuality: bid.proposalQuality || undefined,
        totalScore: bid.totalScore || undefined,
    };
}
function formatAuditLog(log) {
    return {
        id: log.id,
        title: log.title,
        description: log.description,
        timestamp: log.timestamp.toISOString(),
        txHash: log.txHash || undefined,
        iconType: log.iconType,
    };
}
/**
 * Create a new tender (Officer only).
 * txHash is provided from MetaMask - the frontend handles the real blockchain transaction
 */
async function createTender(input, officerId) {
    const tender = await database_1.prisma.tender.create({
        data: {
            title: input.title,
            description: input.description,
            ministry: input.ministry,
            budget: input.budget,
            deadline: new Date(input.deadline),
            status: "Open",
            msmeQuota: input.msmeQuota,
            criteria: JSON.stringify(input.criteria),
            ipfsHash: input.ipfsHash || null,
            minScore: input.minScore || 0,
            txHash: input.txHash || null,
            blockNumber: input.blockNumber || null,
            officerId,
            // Create tender files if provided
            tenderFiles: input.ipfsFiles
                ? {
                    create: input.ipfsFiles.map((f) => ({
                        name: f.name,
                        size: f.size,
                        hash: f.hash,
                        uploadedAt: new Date(f.uploadedAt),
                    })),
                }
                : undefined,
            // Initial audit log
            auditLogs: {
                create: [
                    {
                        title: "Tender Created",
                        description: `Tender drafted by officer`,
                        iconType: "created",
                    },
                    {
                        title: "Tender Published",
                        description: `Tender published on-chain via MetaMask`,
                        txHash: input.txHash || null,
                        iconType: "published",
                    },
                ],
            },
        },
        include: {
            bids: {
                include: { vendor: true },
            },
            tenderFiles: true,
            auditLogs: true,
        },
    });
    return formatTender(tender);
}
/**
 * Get tender by ID with full details.
 */
async function getTenderById(tenderId) {
    const tender = await database_1.prisma.tender.findUnique({
        where: { id: tenderId },
        include: {
            bids: {
                include: { vendor: true },
                orderBy: { submittedAt: "desc" },
            },
            tenderFiles: true,
            auditLogs: {
                orderBy: { timestamp: "asc" },
            },
        },
    });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    return formatTender(tender);
}
/**
 * List tenders with filtering, search, and pagination.
 */
async function listTenders(query) {
    const { status, ministry, search, page, limit, sortBy, sortOrder } = query;
    // Build where clause
    const where = {};
    if (status)
        where.status = status;
    if (ministry)
        where.ministry = { contains: ministry, mode: "insensitive" };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    // Get total count for pagination
    const total = await database_1.prisma.tender.count({ where });
    // Get tenders
    const tenders = await database_1.prisma.tender.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
            _count: { select: { bids: true } },
            tenderFiles: true,
            auditLogs: {
                orderBy: { timestamp: "asc" },
                take: 1,
            },
        },
    });
    return {
        data: tenders.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description.substring(0, 200),
            ministry: t.ministry || "",
            budget: t.budget,
            deadline: t.deadline.toISOString(),
            status: t.status,
            msmeQuota: t.msmeQuota,
            ipfsHash: t.ipfsHash || undefined,
            txHash: t.txHash || undefined,
            blockNumber: t.blockNumber || undefined,
            createdAt: t.createdAt.toISOString(),
            bidsCount: t._count.bids,
            winnerAddress: t.winnerAddress || undefined,
            winnerName: t.winnerName || undefined,
            isNew: Date.now() - new Date(t.createdAt).getTime() < 24 * 60 * 60 * 1000,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
/**
 * Update a tender (Officer only, before deadline).
 */
async function updateTender(tenderId, input, officerId) {
    const tender = await database_1.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    if (tender.officerId !== officerId) {
        throw new errorHandler_1.AppError("You can only update your own tenders", 403);
    }
    if (tender.status !== "Draft" && tender.status !== "Open") {
        throw new errorHandler_1.AppError("Cannot update tender after bidding has closed", 400);
    }
    const updateData = {};
    if (input.title !== undefined)
        updateData.title = input.title;
    if (input.description !== undefined)
        updateData.description = input.description;
    if (input.budget !== undefined)
        updateData.budget = input.budget;
    if (input.deadline !== undefined)
        updateData.deadline = new Date(input.deadline);
    if (input.status !== undefined)
        updateData.status = input.status;
    if (input.msmeQuota !== undefined)
        updateData.msmeQuota = input.msmeQuota;
    if (input.criteria !== undefined)
        updateData.criteria = JSON.stringify(input.criteria);
    if (input.ipfsHash !== undefined)
        updateData.ipfsHash = input.ipfsHash;
    // Add audit log for update
    await database_1.prisma.auditLog.create({
        data: {
            title: "Tender Updated",
            description: "Tender details were modified",
            iconType: "evaluation",
            tenderId,
        },
    });
    const updated = await database_1.prisma.tender.update({
        where: { id: tenderId },
        data: updateData,
        include: {
            bids: { include: { vendor: true } },
            tenderFiles: true,
            auditLogs: { orderBy: { timestamp: "asc" } },
        },
    });
    return formatTender(updated);
}
/**
 * Change tender status (Officer only).
 */
async function updateTenderStatus(tenderId, status, officerId) {
    const tender = await database_1.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    if (tender.officerId !== officerId) {
        throw new errorHandler_1.AppError("You can only modify your own tenders", 403);
    }
    const updated = await database_1.prisma.tender.update({
        where: { id: tenderId },
        data: { status: status },
        include: {
            bids: { include: { vendor: true } },
            tenderFiles: true,
            auditLogs: { orderBy: { timestamp: "asc" } },
        },
    });
    // Add audit log
    await database_1.prisma.auditLog.create({
        data: {
            title: `Status Changed to ${status}`,
            description: `Tender status updated to ${status}`,
            iconType: status === "Awarded" ? "completed" : "evaluation",
            tenderId,
        },
    });
    return formatTender(updated);
}
/**
 * Delete a tender (Officer only, only if no bids).
 */
async function deleteTender(tenderId, officerId) {
    const tender = await database_1.prisma.tender.findUnique({
        where: { id: tenderId },
        include: { _count: { select: { bids: true } } },
    });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    if (tender.officerId !== officerId) {
        throw new errorHandler_1.AppError("You can only delete your own tenders", 403);
    }
    if (tender._count.bids > 0) {
        throw new errorHandler_1.AppError("Cannot delete tender with existing bids", 400);
    }
    await database_1.prisma.tender.delete({ where: { id: tenderId } });
}
//# sourceMappingURL=tender.service.js.map