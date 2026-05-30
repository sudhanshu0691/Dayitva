"use strict";
// ============================================================
// Bid Service
// Handles bid submission, reveal, and evaluation
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitBid = submitBid;
exports.revealBid = revealBid;
exports.getTenderBids = getTenderBids;
exports.evaluateTender = evaluateTender;
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const scoring_service_1 = require("./scoring.service");
/**
 * Generate a simulated blockchain transaction.
 */
function generateTxData() {
    if (env_1.env.BLOCKCHAIN_SIMULATION_MODE) {
        return {
            txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
            blockNumber: Math.floor(Math.random() * 50000) + 18240000,
        };
    }
    return { txHash: null, blockNumber: null };
}
/**
 * Submit an encrypted bid (commit phase).
 * Vendor submits a hash of their bid parameters.
 */
async function submitBid(tenderId, input, vendorId) {
    // Check tender exists and is open
    const tender = await database_1.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    if (tender.status !== "Open") {
        throw new errorHandler_1.AppError("Tender is not accepting bids", 400);
    }
    if (new Date() > tender.deadline) {
        throw new errorHandler_1.AppError("Tender deadline has passed", 400);
    }
    // Check vendor hasn't already bid
    const existingBid = await database_1.prisma.bid.findFirst({
        where: { tenderId, vendorId },
    });
    if (existingBid) {
        throw new errorHandler_1.AppError("You have already submitted a bid for this tender", 409);
    }
    // Check vendor KYC is approved
    const vendor = await database_1.prisma.user.findUnique({ where: { id: vendorId } });
    if (!vendor || vendor.kycStatus !== "Approved") {
        throw new errorHandler_1.AppError("Your KYC must be approved before submitting bids", 403);
    }
    const txData = generateTxData();
    // Create the bid
    const bid = await database_1.prisma.bid.create({
        data: {
            tenderId,
            vendorId,
            encryptedBidHash: input.encryptedBidHash,
            price: input.price || null,
            status: "Submitted",
            txHash: txData.txHash,
            blockNumber: txData.blockNumber,
        },
        include: { vendor: true },
    });
    // Create audit log
    await database_1.prisma.auditLog.create({
        data: {
            title: "Encrypted Bid Submitted",
            description: `Sealed bid submitted by ${vendor.name}`,
            iconType: "bid_submitted",
            txHash: txData.txHash,
            tenderId,
        },
    });
    // Create notification for tender officer
    await database_1.prisma.notification.create({
        data: {
            title: "New Bid Submitted",
            message: `Vendor '${vendor.name}' submitted a sealed bid`,
            category: "bid",
            actionUrl: `/tenders/${tenderId}`,
            userId: tender.officerId,
        },
    });
    return {
        id: bid.id,
        tenderId: bid.tenderId,
        vendorName: vendor.name,
        vendorAddress: vendor.walletAddress || "",
        price: bid.price || undefined,
        isEncrypted: true,
        submittedAt: bid.submittedAt.toISOString(),
        txHash: bid.txHash || undefined,
        blockNumber: bid.blockNumber || undefined,
    };
}
/**
 * Reveal a bid after the deadline (reveal phase).
 * Vendor reveals price and scoring parameters.
 */
async function revealBid(tenderId, input, vendorId) {
    const tender = await database_1.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    if (new Date() <= tender.deadline) {
        throw new errorHandler_1.AppError("Cannot reveal bid before deadline", 400);
    }
    const bid = await database_1.prisma.bid.findFirst({
        where: { tenderId, vendorId },
        include: { vendor: true },
    });
    if (!bid) {
        throw new errorHandler_1.AppError("Bid not found", 404);
    }
    if (bid.status !== "Submitted") {
        throw new errorHandler_1.AppError("Bid already revealed", 400);
    }
    // Calculate score
    const scoreResult = (0, scoring_service_1.calculateBidScore)({
        price: input.price,
        budget: tender.budget,
        financialStrength: input.financialStrength,
        pastExperience: input.pastExperience,
        performanceFeedback: input.performanceFeedback,
        technicalCapability: input.technicalCapability,
        compliance: input.compliance,
        proposalQuality: input.proposalQuality,
    });
    const txData = generateTxData();
    // Update bid with revealed data
    const updatedBid = await database_1.prisma.bid.update({
        where: { id: bid.id },
        data: {
            price: input.price,
            priceScore: scoreResult.priceScore,
            financialStrength: scoreResult.financialStrength,
            pastExperience: scoreResult.pastExperience,
            performanceFeedback: scoreResult.performanceFeedback,
            technicalCapability: scoreResult.technicalCapability,
            compliance: scoreResult.compliance,
            proposalQuality: scoreResult.proposalQuality,
            totalScore: scoreResult.totalScore,
            status: "Revealed",
            revealedAt: new Date(),
            txHash: txData.txHash,
            blockNumber: txData.blockNumber,
        },
        include: { vendor: true },
    });
    // Audit log
    await database_1.prisma.auditLog.create({
        data: {
            title: "Bid Revealed",
            description: `Bid by ${bid.vendor.name} revealed with score ${scoreResult.totalScore}`,
            iconType: "evaluation",
            txHash: txData.txHash,
            tenderId,
        },
    });
    return {
        id: updatedBid.id,
        tenderId: updatedBid.tenderId,
        vendorName: updatedBid.vendor.name,
        vendorAddress: updatedBid.vendor.walletAddress || "",
        price: updatedBid.price || undefined,
        isEncrypted: false,
        submittedAt: updatedBid.submittedAt.toISOString(),
        txHash: updatedBid.txHash || undefined,
        blockNumber: updatedBid.blockNumber || undefined,
        ...scoreResult,
    };
}
/**
 * Get all bids for a tender (Officer only).
 */
async function getTenderBids(tenderId, officerId) {
    const tender = await database_1.prisma.tender.findUnique({ where: { id: tenderId } });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    if (tender.officerId !== officerId) {
        throw new errorHandler_1.AppError("You can only view bids on your own tenders", 403);
    }
    const bids = await database_1.prisma.bid.findMany({
        where: { tenderId },
        include: { vendor: true },
        orderBy: { submittedAt: "asc" },
    });
    return bids.map((b) => ({
        id: b.id,
        tenderId: b.tenderId,
        vendorName: b.vendor.name,
        vendorAddress: b.vendor.walletAddress || "",
        price: b.price || undefined,
        isEncrypted: b.status === "Submitted",
        submittedAt: b.submittedAt.toISOString(),
        txHash: b.txHash || undefined,
        blockNumber: b.blockNumber || undefined,
        priceScore: b.priceScore || undefined,
        financialStrength: b.financialStrength || undefined,
        pastExperience: b.pastExperience || undefined,
        performanceFeedback: b.performanceFeedback || undefined,
        technicalCapability: b.technicalCapability || undefined,
        compliance: b.compliance || undefined,
        proposalQuality: b.proposalQuality || undefined,
        totalScore: b.totalScore || undefined,
    }));
}
/**
 * Evaluate a tender after all bids are revealed.
 * Calculates final scores and declares winner.
 */
async function evaluateTender(tenderId, officerId) {
    const tender = await database_1.prisma.tender.findUnique({
        where: { id: tenderId },
        include: {
            bids: {
                where: { status: "Revealed" },
                include: { vendor: true },
            },
        },
    });
    if (!tender) {
        throw new errorHandler_1.AppError("Tender not found", 404);
    }
    if (tender.officerId !== officerId) {
        throw new errorHandler_1.AppError("You can only evaluate your own tenders", 403);
    }
    const revealedBids = tender.bids.map((b) => ({
        id: b.id,
        vendorId: b.vendorId,
        vendorName: b.vendor.name,
        vendorAddress: b.vendor.walletAddress || "",
        totalScore: b.totalScore || 0,
        price: b.price || 0,
        submittedAt: b.submittedAt,
    }));
    const winner = (0, scoring_service_1.determineWinner)(revealedBids);
    if (!winner) {
        throw new errorHandler_1.AppError("No revealed bids to evaluate", 400);
    }
    const txData = generateTxData();
    // Update tender with winner
    await database_1.prisma.tender.update({
        where: { id: tenderId },
        data: {
            status: "Awarded",
            winnerAddress: winner.winnerAddress,
            winnerPrice: winner.winnerPrice,
            winnerName: winner.winnerName,
            txHash: txData.txHash,
            blockNumber: txData.blockNumber,
        },
    });
    // Audit log
    await database_1.prisma.auditLog.create({
        data: {
            title: "Winner Declared",
            description: `Winner: ${winner.winnerName} with score ${winner.winnerScore}`,
            iconType: "completed",
            txHash: txData.txHash,
            tenderId,
        },
    });
    // Notify all bidders
    for (const bid of revealedBids) {
        await database_1.prisma.notification.create({
            data: {
                title: bid.vendorId === winner.winnerId ? "🎉 You Won!" : "Tender Evaluation Complete",
                message: bid.vendorId === winner.winnerId
                    ? `Congratulations! Your bid for "${tender.title}" has been selected.`
                    : `The tender "${tender.title}" has been awarded to ${winner.winnerName}.`,
                category: "bid",
                actionUrl: `/tenders/${tenderId}`,
                userId: bid.vendorId,
            },
        });
    }
    return {
        winner,
        txHash: txData.txHash,
        blockNumber: txData.blockNumber,
    };
}
//# sourceMappingURL=bid.service.js.map