// ============================================================
// Blockchain Controller
// Handles MetaMask transaction storage and verification
// ============================================================

import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as blockchainService from "../services/blockchain.service";
import { env } from "../config/env";

/**
 * Store a blockchain transaction after MetaMask confirmation
 */
export async function storeTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { txHash, walletAddress, type, tenderId } = req.body;
    const userId = req.user!.userId;

    if (!txHash || !walletAddress || !type) {
      return res.status(400).json({ error: "txHash, walletAddress, and type are required" });
    }

    const result = await blockchainService.storeTransaction({
      txHash,
      walletAddress,
      type,
      userId,
      tenderId: tenderId || undefined,
      status: "success",
    });

    res.json({ success: true, transaction: result });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify a transaction on-chain
 */
export async function verifyTransaction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const txHash = req.params.txHash as string;
    const result = await blockchainService.verifyTransactionOnChain(txHash);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get transaction history for current user
 */
export async function getMyTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { prisma } = await import("../config/database");
    const transactions = await prisma.blockchainTx.findMany({
      where: { entityId: userId },
      orderBy: { timestamp: "desc" },
      take: 50,
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

/**
 * Get transaction by tender ID
 */
export async function getTenderTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tenderId = req.params.tenderId as string;
    const { prisma } = await import("../config/database");
    const transactions = await prisma.blockchainTx.findMany({
      where: { tenderId },
      orderBy: { timestamp: "desc" },
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
}

/**
 * Get contract info for frontend
 */
export async function getContractInfo(req: AuthRequest, res: Response) {
  res.json({
    contractAddress: env.CONTRACT_ADDRESS,
    chainId: env.BLOCKCHAIN_CHAIN_ID,
    rpcUrl: env.BLOCKCHAIN_RPC_URL,
    abi: blockchainService.getContractABI(),
  });
}

