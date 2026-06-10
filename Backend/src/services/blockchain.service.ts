// ============================================================
// Blockchain Service
// Real Ethereum Sepolia Testnet via MetaMask ONLY
// Backend stores transaction metadata from MetaMask confirms
// NO simulated/fallback transactions - all real on-chain
// ============================================================

import { ethers } from "ethers";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { prisma } from "../config/database";
import { TxType, TxStatus } from "@prisma/client";

/**
 * Generate an Etherscan URL for Sepolia Testnet transactions
 */
export function getExplorerTxUrl(txHash: string): string {
  return `${env.BLOCKCHAIN_EXPLORER_URL}/tx/${txHash}`;
}

/**
 * Generate an Etherscan URL for an address on Sepolia
 */
export function getExplorerAddressUrl(address: string): string {
  return `${env.BLOCKCHAIN_EXPLORER_URL}/address/${address}`;
}

/**
 * Store a blockchain transaction record after MetaMask confirmation
 */
export async function storeTransaction(params: {
  txHash: string;
  walletAddress: string;
  type: string;
  status?: string;
  metadata?: Record<string, any>;
  tenderId?: string;
  userId?: string;
  chainId?: number;
}): Promise<any> {
  const tx = await prisma.blockchainTx.create({
    data: {
      txHash: params.txHash,
      walletAddress: params.walletAddress,
      type: params.type as TxType,
      status: (params.status as TxStatus) || "success",
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      tenderId: params.tenderId || null,
      entityId: params.userId || null,
      entityType: params.userId ? "user" : null,
      chainId: params.chainId || env.BLOCKCHAIN_CHAIN_ID,
      etherscanUrl: getExplorerTxUrl(params.txHash),
    },
  });

  logger.info(`✅ Blockchain tx stored: ${params.txHash} (${params.type}) on Sepolia`);
  return tx;
}

/**
 * Update transaction status after MetaMask confirmation
 */
export async function updateTransactionStatus(txHash: string, status: string): Promise<void> {
  await prisma.blockchainTx.update({
    where: { txHash },
    data: { status: status as TxStatus },
  });
  logger.info(`✅ Tx ${txHash} status updated to ${status}`);
}

/**
 * Verify a transaction exists on Sepolia Testnet
 */
export async function verifyTransactionOnChain(txHash: string): Promise<{
  verified: boolean;
  blockNumber?: number;
  from?: string;
  to?: string;
}> {
  try {
    const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (receipt) {
      return {
        verified: true,
        blockNumber: receipt.blockNumber,
        from: receipt.from,
        to: receipt.to ?? undefined,
      };
    }

    return { verified: false };
  } catch (error: any) {
    logger.error("❌ Transaction verification failed:", { error: error.message });
    return { verified: false };
  }
}

/**
 * Get the current gas price on Sepolia
 */
export async function getGasPrice(): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
    const feeData = await provider.getFeeData();
    return feeData.gasPrice?.toString() || "0";
  } catch (error: any) {
    logger.error("❌ Gas price fetch failed:", { error: error.message });
    return "0";
  }
}

/**
 * Check if the Sepolia network is reachable
 */
export async function isBlockchainReachable(): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    logger.info(`⛓️ Sepolia reachable at block ${blockNumber}`);
    return true;
  } catch (error) {
    logger.error("❌ Sepolia not reachable:", { error });
    return false;
  }
}

/**
 * Get contract ABI for frontend MetaMask interactions
 */
export function getContractABI(): string[] {
  return [
    "function createTender(string _title, string _ipfsHash, uint256 _budget, uint256 _deadline, uint256 _minScore, bool _msmeQuota) external returns (uint256 tenderId)",
    "function submitBid(uint256 _tenderId, bytes32 _encryptedBidHash) external",
    "function revealBid(uint256 _tenderId, uint256 _price, uint256[6] calldata _scores) external",
    "function declareWinner(uint256 _tenderId, address _winner, uint256 _winnerScore) external",
    "function closeTender(uint256 _tenderId) external",
    "event TenderCreated(uint256 indexed tenderId, address indexed officer, string title, string ipfsHash, uint256 budget, uint256 deadline, uint256 timestamp)",
    "event BidSubmitted(uint256 indexed tenderId, address indexed bidder, bytes32 encryptedBidHash, uint256 timestamp)",
    "event WinnerDeclared(uint256 indexed tenderId, address indexed winner, uint256 price, uint256 totalScore, uint256 timestamp)",
  ];
}

export default {
  getExplorerTxUrl,
  getExplorerAddressUrl,
  storeTransaction,
  updateTransactionStatus,
  verifyTransactionOnChain,
  getGasPrice,
  isBlockchainReachable,
  getContractABI,
};