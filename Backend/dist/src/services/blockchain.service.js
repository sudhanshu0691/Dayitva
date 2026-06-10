"use strict";
// ============================================================
// Blockchain Service
// Real Ganache local blockchain via MetaMask ONLY
// Backend stores transaction metadata from MetaMask confirms
// No simulated/fallback transactions - all real on-chain
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExplorerTxUrl = getExplorerTxUrl;
exports.getExplorerAddressUrl = getExplorerAddressUrl;
exports.storeTransaction = storeTransaction;
exports.updateTransactionStatus = updateTransactionStatus;
exports.verifyTransactionOnChain = verifyTransactionOnChain;
exports.getGasPrice = getGasPrice;
exports.isBlockchainReachable = isBlockchainReachable;
exports.getContractABI = getContractABI;
const ethers_1 = require("ethers");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const database_1 = require("../config/database");
/**
 * Generate an explorer URL for a transaction (Ganache has no native explorer)
 */
function getExplorerTxUrl(txHash) {
    if (env_1.env.BLOCKCHAIN_EXPLORER_URL) {
        return `${env_1.env.BLOCKCHAIN_EXPLORER_URL}/tx/${txHash}`;
    }
    return `#tx-${txHash}`; // local fallback
}
/**
 * Generate an explorer URL for an address
 */
function getExplorerAddressUrl(address) {
    if (env_1.env.BLOCKCHAIN_EXPLORER_URL) {
        return `${env_1.env.BLOCKCHAIN_EXPLORER_URL}/address/${address}`;
    }
    return `#address-${address}`;
}
/**
 * Store a blockchain transaction record after MetaMask confirmation
 */
async function storeTransaction(params) {
    const tx = await database_1.prisma.blockchainTx.create({
        data: {
            txHash: params.txHash,
            walletAddress: params.walletAddress,
            type: params.type,
            status: params.status || "success",
            metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            tenderId: params.tenderId || null,
            entityId: params.userId || null,
            entityType: params.userId ? "user" : null,
            chainId: params.chainId || env_1.env.BLOCKCHAIN_CHAIN_ID,
        },
    });
    logger_1.logger.info(`✅ Blockchain tx stored: ${params.txHash} (${params.type}) on Ganache`);
    return tx;
}
/**
 * Update transaction status after MetaMask confirmation
 */
async function updateTransactionStatus(txHash, status) {
    await database_1.prisma.blockchainTx.update({
        where: { txHash },
        data: { status: status },
    });
    logger_1.logger.info(`✅ Tx ${txHash} status updated to ${status}`);
}
/**
 * Verify a transaction exists on Ganache
 */
async function verifyTransactionOnChain(txHash) {
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(env_1.env.BLOCKCHAIN_RPC_URL);
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
    }
    catch (error) {
        logger_1.logger.error("❌ Transaction verification failed:", { error: error.message });
        return { verified: false };
    }
}
/**
 * Get the current gas price on Ganache
 */
async function getGasPrice() {
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(env_1.env.BLOCKCHAIN_RPC_URL);
        const feeData = await provider.getFeeData();
        return feeData.gasPrice?.toString() || "0";
    }
    catch (error) {
        logger_1.logger.error("❌ Gas price fetch failed:", { error: error.message });
        return "0";
    }
}
/**
 * Check if the Ganache network is reachable
 */
async function isBlockchainReachable() {
    try {
        const provider = new ethers_1.ethers.JsonRpcProvider(env_1.env.BLOCKCHAIN_RPC_URL);
        const blockNumber = await provider.getBlockNumber();
        logger_1.logger.info(`⛓️ Ganache reachable at block ${blockNumber}`);
        return true;
    }
    catch (error) {
        logger_1.logger.error("❌ Ganache not reachable:", { error });
        return false;
    }
}
/**
 * Get contract ABI for frontend MetaMask interactions
 */
function getContractABI() {
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
exports.default = {
    getExplorerTxUrl,
    getExplorerAddressUrl,
    storeTransaction,
    updateTransactionStatus,
    verifyTransactionOnChain,
    getGasPrice,
    isBlockchainReachable,
    getContractABI,
};
//# sourceMappingURL=blockchain.service.js.map