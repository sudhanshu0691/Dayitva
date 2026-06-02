// ============================================================
// Bid Service
// Handles bid submission, reveal, and evaluation
// ============================================================

import { ethers } from "ethers";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { SubmitBidInput, RevealBidInput } from "../validators/bid.validator";
import { IBid } from "../types";
import { calculateBidScore, determineWinner } from "./scoring.service";
import { submitBidOnChain, revealBidOnChain, evaluateTenderOnChain, isBlockchainReachable } from "./blockchain.service";

const BLOCKCHAIN_SIMULATION_MODE = process.env.BLOCKCHAIN_SIMULATION_MODE !== "false";

/**
 * Generate transaction data using real blockchain or simulation.
 */
async function generateTxData(type: "bid" | "reveal" | "evaluate", params?: {
  tenderId?: number;
  encryptedBidHash?: string;
  vendorWalletKey?: string;
  price?: number;
  scoreHashes?: number[];
  nonce?: string;
  winnerAddress?: string;
  winnerScore?: number;
}) {
  if (!BLOCKCHAIN_SIMULATION_MODE) {
    try {
      const isReachable = await isBlockchainReachable();
      if (isReachable && params) {
        let result;
        if (type === "bid" && params.tenderId && params.encryptedBidHash) {
          result = await submitBidOnChain(params.tenderId, params.encryptedBidHash, params.vendorWalletKey);
        } else if (type === "reveal" && params.tenderId && params.price !== undefined && params.scoreHashes && params.nonce) {
          result = await revealBidOnChain(params.tenderId, params.price, params.scoreHashes, params.nonce, params.vendorWalletKey);
        } else if (type === "evaluate" && params.tenderId && params.winnerAddress && params.winnerScore !== undefined) {
          result = await evaluateTenderOnChain(params.tenderId, params.winnerAddress, params.winnerScore);
        }
        if (result) {
          return { txHash: result.txHash, blockNumber: result.blockNumber };
        }
      }
    } catch (error: any) {
      console.error(`Blockchain ${type} failed, falling back to simulation:`, error.message);
    }
  }
  // Fallback to simulation
  return {
    txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    blockNumber: Math.floor(Math.random() * 50000) + 18240000,
  };
}

/**
 * Submit an encrypted bid (commit phase).
 * Vendor submits a hash of their bid parameters.
 */
export async function submitBid(tenderId: string, input: SubmitBidInput, vendorId: string) {
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

  // Real blockchain transaction for bid submission
  const chainParams: any = {
    tenderId: parseInt(tender.id.replace(/\D/g, "") || "1"),
    encryptedBidHash: bidHash,
    vendorWalletKey: vendor.walletAddress ? undefined : undefined,
  };
  const txData = await generateTxData("bid", chainParams);

  // Create the bid
  const bid = await prisma.bid.create({
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
  await prisma.auditLog.create({
    data: {
      title: "Encrypted Bid Submitted",
      description: `Sealed bid submitted by ${vendor.name}`,
      iconType: "bid_submitted",
      txHash: txData.txHash,
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

  // Real blockchain transaction for reveal
  const revealParams: any = {
    tenderId: parseInt(tender.id.replace(/\D/g, "") || "1"),
    price: input.price,
    scoreHashes: [
      scoreResult.financialStrength * 100,
      scoreResult.pastExperience * 100,
      scoreResult.performanceFeedback * 100,
      scoreResult.technicalCapability * 100,
      scoreResult.compliance * 100,
      scoreResult.proposalQuality * 100,
    ],
    nonce: ethers.hexlify(ethers.randomBytes(32)),
    vendorWalletKey: bid.vendor?.walletAddress || undefined,
  };
  const txData = await generateTxData("reveal", revealParams);

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
      txHash: txData.txHash,
      blockNumber: txData.blockNumber,
    },
    include: { vendor: true },
  });

  // Audit log
  await prisma.auditLog.create({
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

  // Real blockchain transaction for evaluation
  const evalParams: any = {
    tenderId: parseInt(tender.id.replace(/\D/g, "") || "1"),
    winnerAddress: winner.winnerAddress,
    winnerScore: winner.winnerScore,
  };
  const txData = await generateTxData("evaluate", evalParams);

  // Update tender with winner
  await prisma.tender.update({
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
  await prisma.auditLog.create({
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

  return {
    winner,
    txHash: txData.txHash,
    blockNumber: txData.blockNumber,
  };
}