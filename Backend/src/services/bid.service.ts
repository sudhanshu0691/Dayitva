// ============================================================
// Bid Service
// Handles bid submission, reveal, and evaluation
// Real MetaMask transactions - no simulation
// ============================================================

import { ethers } from "ethers";
import { prisma } from "../config/database";
import { AppError } from "../middleware/errorHandler";
import { SubmitBidInput, RevealBidInput } from "../validators/bid.validator";
import { calculateBidScore, determineWinner } from "./scoring.service";
import { storeTransaction, getExplorerTxUrl } from "./blockchain.service";
import { getIO } from "./socket.service";

/**
 * Submit an encrypted bid (commit phase).
 * Vendor submits a hash of their bid parameters.
 * txHash comes from the frontend MetaMask transaction.
 */
export async function submitBid(
  tenderId: string, 
  input: SubmitBidInput, 
  vendorId: string,
  txHash?: string
) {
  // Check tender exists and is open
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) {
    throw new AppError("Tender not found", 404);
  }
  if (tender.status !== "Open") {
    throw new AppError("Tender is not accepting bids", 400);
  }
  if (new Date() > tender.deadline) {
    throw new AppError("Tender deadline has passed", 400);
  }

  // Check vendor hasn't already bid
  const existingBid = await prisma.bid.findFirst({
    where: { tenderId, vendorId },
  });
  if (existingBid) {
    throw new AppError("You have already submitted a bid for this tender", 409);
  }

  // Check vendor KYC is approved
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor || vendor.kycStatus !== "Approved") {
    throw new AppError("Your KYC must be approved before submitting bids", 403);
  }

  // Generate encrypted bid hash for on-chain commitment
  const bidHash = ethers.keccak256(
    ethers.toUtf8Bytes(input.encryptedBidHash + vendorId + Date.now())
  );

  // Create the bid with real txHash from MetaMask
  const bid = await prisma.bid.create({
    data: {
      tenderId,
      vendorId,
      encryptedBidHash: input.encryptedBidHash,
      price: input.price || null,
      status: "Submitted",
      txHash: txHash || null,
    },
    include: { vendor: true },
  });

  // Store blockchain transaction record if txHash provided
  if (txHash && vendor.walletAddress) {
    await storeTransaction({
      txHash,
      walletAddress: vendor.walletAddress,
      type: "BID_SUBMITTED",
      status: "success",
      metadata: { tenderTitle: tender.title, vendorName: vendor.name },
      tenderId,
      userId: vendorId,
    });
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      title: "Encrypted Bid Submitted",
      description: `Sealed bid submitted by ${vendor.name}`,
      iconType: "bid_submitted",
      txHash: txHash || null,
      tenderId,
    },
  });

  // Create notification for tender officer
  await prisma.notification.create({
    data: {
      title: "New Bid Submitted",
      message: `Vendor '${vendor.name}' submitted a sealed bid`,
      category: "bid",
      actionUrl: `/tenders/${tenderId}`,
      officerId: tender.officerId,
    },
  });

  // Emit socket event for real-time update
  const io = getIO();
  if (io) {
    io.to(`tender:${tenderId}`).emit("bid-submitted", {
      tenderId,
      message: `New bid received from ${vendor.name}`,
    });
    // Notify officer
    io.to(`user:${tender.officerId}`).emit("notification", {
      title: "New Bid Submitted",
      message: `Vendor '${vendor.name}' submitted a sealed bid`,
      category: "bid",
    });
  }

  return {
    id: bid.id,
    tenderId: bid.tenderId,
    vendorName: vendor.name,
    vendorAddress: vendor.walletAddress || "",
    price: bid.price || undefined,
    isEncrypted: true,
    submittedAt: bid.submittedAt.toISOString(),
    txHash: bid.txHash || undefined,
  };
}

/**
 * Reveal a bid after the deadline (reveal phase).
 * Vendor reveals price and scoring parameters.
 */
export async function revealBid(
  tenderId: string,
  input: RevealBidInput,
  vendorId: string
) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) {
    throw new AppError("Tender not found", 404);
  }
  if (new Date() <= tender.deadline) {
    throw new AppError("Cannot reveal bid before deadline", 400);
  }

  const bid = await prisma.bid.findFirst({
    where: { tenderId, vendorId },
    include: { vendor: true },
  });

  if (!bid) {
    throw new AppError("Bid not found", 404);
  }
  if (bid.status !== "Submitted") {
    throw new AppError("Bid already revealed", 400);
  }

  // Calculate score
  const scoreResult = calculateBidScore({
    price: input.price,
    budget: tender.budget,
    financialStrength: input.financialStrength,
    pastExperience: input.pastExperience,
    performanceFeedback: input.performanceFeedback,
    technicalCapability: input.technicalCapability,
    compliance: input.compliance,
    proposalQuality: input.proposalQuality,
  });

  // Update bid with revealed data
  const updatedBid = await prisma.bid.update({
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
    },
    include: { vendor: true },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      title: "Bid Revealed",
      description: `Bid by ${bid.vendor.name} revealed with score ${scoreResult.totalScore}`,
      iconType: "evaluation",
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
    ...scoreResult,
  };
}

/**
 * Get all bids for a tender (Officer only).
 */
export async function getTenderBids(tenderId: string, officerId: string) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) {
    throw new AppError("Tender not found", 404);
  }
  if (tender.officerId !== officerId) {
    throw new AppError("You can only view bids on your own tenders", 403);
  }

  const bids = await prisma.bid.findMany({
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
export async function evaluateTender(tenderId: string, officerId: string) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      bids: {
        where: { status: "Revealed" },
        include: { vendor: true },
      },
    },
  });

  if (!tender) {
    throw new AppError("Tender not found", 404);
  }
  if (tender.officerId !== officerId) {
    throw new AppError("You can only evaluate your own tenders", 403);
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

  const winner = determineWinner(revealedBids);

  if (!winner) {
    throw new AppError("No revealed bids to evaluate", 400);
  }

  // Update tender with winner
  await prisma.tender.update({
    where: { id: tenderId },
    data: {
      status: "Awarded",
      winnerAddress: winner.winnerAddress,
      winnerPrice: winner.winnerPrice,
      winnerName: winner.winnerName,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      title: "Winner Declared",
      description: `Winner: ${winner.winnerName} with score ${winner.winnerScore}`,
      iconType: "completed",
      tenderId,
    },
  });

  // Notify all bidders
  for (const bid of revealedBids) {
    await prisma.notification.create({
      data: {
        title: bid.vendorId === winner.winnerId ? "🎉 You Won!" : "Tender Evaluation Complete",
        message: bid.vendorId === winner.winnerId
          ? `Congratulations! Your bid for "${tender.title}" has been selected.`
          : `The tender "${tender.title}" has been awarded to ${winner.winnerName}.`,
        category: "bid",
        actionUrl: `/tenders/${tenderId}`,
        vendorId: bid.vendorId,
      },
    });
  }

  // Emit socket events
  const io = getIO();
  if (io) {
    io.to(`tender:${tenderId}`).emit("winner-declared", {
      tenderId,
      winner: winner.winnerName,
    });
  }

  return {
    winner,
  };
}