"use strict";
// ============================================================
// Blockchain Service - Ganache Local Network
// Handles all Ethereum blockchain interactions via Ethers.js v6
// Connects to local Ganache at http://127.0.0.1:7545
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = void 0;
const ethers_1 = require("ethers");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Manages all blockchain interactions with local Ganache network.
 * Supports two separate wallet accounts:
 *   - Officer Wallet: for creating tenders on-chain
 *   - Vendor Wallet: for submitting bids on-chain
 * MetaMask users connect their own wallets via the frontend.
 */
class GanacheBlockchainService {
    provider = null;
    officerWallet = null;
    vendorWallet = null;
    contract = null;
    isConnected = false;
    /**
     * Initialize connection to local Ganache.
     * @returns true if connection successful, false otherwise
     */
    async connect() {
        try {
            logger_1.logger.info("🔄 Connecting to local Ganache at", env_1.env.ETH_RPC_URL);
            this.provider = new ethers_1.ethers.JsonRpcProvider(env_1.env.ETH_RPC_URL, {
                chainId: env_1.env.ETH_CHAIN_ID,
                name: "ganache",
            });
            // Test connection by getting network info
            const network = await this.provider.getNetwork();
            logger_1.logger.info(`✅ Connected to Ganache | Chain ID: ${network.chainId}`);
            // Set up Officer Wallet (for creating tenders on-chain)
            if (env_1.env.OFFICER_PRIVATE_KEY) {
                this.officerWallet = new ethers_1.ethers.Wallet(env_1.env.OFFICER_PRIVATE_KEY, this.provider);
                const bal = await this.provider.getBalance(this.officerWallet.address);
                logger_1.logger.info(`   👤 Officer Wallet: ${this.officerWallet.address} | ${ethers_1.ethers.formatEther(bal)} ETH`);
            }
            // Set up Vendor Wallet (for submitting bids on-chain)
            if (env_1.env.VENDOR_PRIVATE_KEY) {
                this.vendorWallet = new ethers_1.ethers.Wallet(env_1.env.VENDOR_PRIVATE_KEY, this.provider);
                const bal = await this.provider.getBalance(this.vendorWallet.address);
                logger_1.logger.info(`   👤 Vendor Wallet: ${this.vendorWallet.address} | ${ethers_1.ethers.formatEther(bal)} ETH`);
            }
            // Load deployed contract if address provided
            if (env_1.env.CONTRACT_ADDRESS) {
                // Minimal ABI for interaction - full ABI loaded on demand
                const minABI = [
                    "event TenderCreated(uint256 indexed tenderId, address indexed officer, string title, string ipfsHash, uint256 budget, uint256 deadline, uint256 timestamp)",
                    "event BidSubmitted(uint256 indexed tenderId, address indexed bidder, bytes32 encryptedBidHash, uint256 timestamp)",
                    "function createTender(string memory _title, string memory _ipfsHash, uint256 _budget, uint256 _deadline, uint256 _minScore, bool _msmeQuota) external returns (uint256 tenderId)",
                    "function submitBid(uint256 _tenderId, bytes32 _encryptedBidHash) external",
                    "function getTender(uint256 _tenderId) external view returns (tuple(uint256 id, address officer, string title, string ipfsHash, uint256 budget, uint256 deadline, uint256 minScore, bool msmeQuota, uint8 status, address winner, uint256 winnerPrice, uint256 winnerScore, uint256 bidCount, uint256 createdAt, uint256 evaluatedAt))",
                    "function getBid(uint256 _tenderId, address _bidder) external view returns (tuple(uint256 tenderId, address bidder, bytes32 encryptedBidHash, uint256 price, uint256 priceScore, uint256 financialStrength, uint256 pastExperience, uint256 performanceFeedback, uint256 technicalCapability, uint256 compliance, uint256 proposalQuality, uint256 totalScore, uint8 status, uint256 submittedAt, uint256 revealedAt, bool exists))",
                ];
                this.contract = new ethers_1.ethers.Contract(env_1.env.CONTRACT_ADDRESS, minABI, this.officerWallet || this.provider);
                logger_1.logger.info(`✅ Contract loaded at: ${env_1.env.CONTRACT_ADDRESS}`);
            }
            this.isConnected = true;
            logger_1.logger.info("✅ Ganache Blockchain Service Ready");
            return true;
        }
        catch (error) {
            logger_1.logger.warn(`⚠️ Ganache not available: ${error.message}`);
            logger_1.logger.warn("   Running in SIMULATION mode");
            this.isConnected = false;
            return false;
        }
    }
    /**
     * Generate a unique transaction hash (for simulation mode).
     */
    generateTxHash() {
        return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    }
    /**
     * Generate a simulated block number.
     */
    generateBlockNumber() {
        return Math.floor(Math.random() * 50000) + 1;
    }
    /**
     * Get all Ganache accounts from the provider.
     */
    async getAccounts() {
        if (!this.provider)
            return [];
        try {
            return await this.provider.send("eth_accounts", []);
        }
        catch {
            return [];
        }
    }
    /**
     * Get ETH balance of a specific address.
     */
    async getBalance(address) {
        if (!this.provider)
            return "0";
        try {
            const balance = await this.provider.getBalance(address);
            return ethers_1.ethers.formatEther(balance);
        }
        catch {
            return "0";
        }
    }
    /**
     * Create a tender on the Ganache blockchain.
     * Returns transaction data including hash and block number.
     */
    async createTenderOnChain(params) {
        if (!this.contract || !this.officerWallet) {
            logger_1.logger.warn("Contract not deployed - returning simulated tx");
            return null;
        }
        try {
            const tx = await this.contract.createTender(params.title, params.ipfsHash, ethers_1.ethers.parseEther(params.budget.toString()), params.deadline, params.minScore * 100, // Convert to basis points
            params.msmeQuota);
            const receipt = await tx.wait();
            return {
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            };
        }
        catch (error) {
            logger_1.logger.error("❌ On-chain tender creation failed:", error.message);
            return null;
        }
    }
    /**
     * Listen for new blocks on Ganache (for real-time updates).
     */
    onNewBlock(callback) {
        if (!this.provider)
            return;
        this.provider.on("block", (blockNumber) => {
            callback(blockNumber);
        });
    }
    /**
     * Listen for TenderCreated events from the contract.
     */
    onTenderCreated(callback) {
        if (!this.contract)
            return;
        this.contract.on("TenderCreated", (tenderId, officer, title) => {
            callback(Number(tenderId), officer, title);
        });
    }
    /**
     * Listen for BidSubmitted events from the contract.
     */
    onBidSubmitted(callback) {
        if (!this.contract)
            return;
        this.contract.on("BidSubmitted", (tenderId, bidder, encryptedBidHash) => {
            callback(Number(tenderId), bidder, encryptedBidHash);
        });
    }
}
// Singleton instance - shared across the entire app
exports.blockchainService = new GanacheBlockchainService();
//# sourceMappingURL=blockchain.service.js.map