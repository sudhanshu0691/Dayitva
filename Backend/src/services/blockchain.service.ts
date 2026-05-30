// ============================================================
// Blockchain Service - Ganache Local Network
// Handles all Ethereum blockchain interactions via Ethers.js v6
// Connects to local Ganache at http://127.0.0.1:7545
// ============================================================

import { ethers } from "ethers";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Manages all blockchain interactions with local Ganache network.
 * Supports two separate wallet accounts:
 *   - Officer Wallet: for creating tenders on-chain
 *   - Vendor Wallet: for submitting bids on-chain
 * MetaMask users connect their own wallets via the frontend.
 */
class GanacheBlockchainService {
  public provider: ethers.JsonRpcProvider | null = null;
  public officerWallet: ethers.Wallet | null = null;
  public vendorWallet: ethers.Wallet | null = null;
  public contract: ethers.Contract | null = null;
  public isConnected: boolean = false;

  /**
   * Initialize connection to local Ganache.
   * @returns true if connection successful, false otherwise
   */
  async connect(): Promise<boolean> {
    try {
      logger.info("🔄 Connecting to local Ganache at", env.ETH_RPC_URL);

      this.provider = new ethers.JsonRpcProvider(env.ETH_RPC_URL, {
        chainId: env.ETH_CHAIN_ID,
        name: "ganache",
      });

      // Test connection by getting network info
      const network = await this.provider.getNetwork();
      logger.info(`✅ Connected to Ganache | Chain ID: ${network.chainId}`);

      // Set up Officer Wallet (for creating tenders on-chain)
      if (env.OFFICER_PRIVATE_KEY) {
        this.officerWallet = new ethers.Wallet(env.OFFICER_PRIVATE_KEY, this.provider);
        const bal = await this.provider.getBalance(this.officerWallet.address);
        logger.info(`   👤 Officer Wallet: ${this.officerWallet.address} | ${ethers.formatEther(bal)} ETH`);
      }

      // Set up Vendor Wallet (for submitting bids on-chain)
      if (env.VENDOR_PRIVATE_KEY) {
        this.vendorWallet = new ethers.Wallet(env.VENDOR_PRIVATE_KEY, this.provider);
        const bal = await this.provider.getBalance(this.vendorWallet.address);
        logger.info(`   👤 Vendor Wallet: ${this.vendorWallet.address} | ${ethers.formatEther(bal)} ETH`);
      }

      // Load deployed contract if address provided
      if (env.CONTRACT_ADDRESS) {
        // Minimal ABI for interaction - full ABI loaded on demand
        const minABI = [
          "event TenderCreated(uint256 indexed tenderId, address indexed officer, string title, string ipfsHash, uint256 budget, uint256 deadline, uint256 timestamp)",
          "event BidSubmitted(uint256 indexed tenderId, address indexed bidder, bytes32 encryptedBidHash, uint256 timestamp)",
          "function createTender(string memory _title, string memory _ipfsHash, uint256 _budget, uint256 _deadline, uint256 _minScore, bool _msmeQuota) external returns (uint256 tenderId)",
          "function submitBid(uint256 _tenderId, bytes32 _encryptedBidHash) external",
          "function getTender(uint256 _tenderId) external view returns (tuple(uint256 id, address officer, string title, string ipfsHash, uint256 budget, uint256 deadline, uint256 minScore, bool msmeQuota, uint8 status, address winner, uint256 winnerPrice, uint256 winnerScore, uint256 bidCount, uint256 createdAt, uint256 evaluatedAt))",
          "function getBid(uint256 _tenderId, address _bidder) external view returns (tuple(uint256 tenderId, address bidder, bytes32 encryptedBidHash, uint256 price, uint256 priceScore, uint256 financialStrength, uint256 pastExperience, uint256 performanceFeedback, uint256 technicalCapability, uint256 compliance, uint256 proposalQuality, uint256 totalScore, uint8 status, uint256 submittedAt, uint256 revealedAt, bool exists))",
        ];

        this.contract = new ethers.Contract(
          env.CONTRACT_ADDRESS,
          minABI,
          this.officerWallet || this.provider
        );
        logger.info(`✅ Contract loaded at: ${env.CONTRACT_ADDRESS}`);
      }

      this.isConnected = true;
      logger.info("✅ Ganache Blockchain Service Ready");
      return true;
    } catch (error: any) {
      logger.warn(`⚠️ Ganache not available: ${error.message}`);
      logger.warn("   Running in SIMULATION mode");
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Generate a unique transaction hash (for simulation mode).
   */
  generateTxHash(): string {
    return "0x" + Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }

  /**
   * Generate a simulated block number.
   */
  generateBlockNumber(): number {
    return Math.floor(Math.random() * 50000) + 1;
  }

  /**
   * Get all Ganache accounts from the provider.
   */
  async getAccounts(): Promise<string[]> {
    if (!this.provider) return [];
    try {
      return await this.provider.send("eth_accounts", []);
    } catch {
      return [];
    }
  }

  /**
   * Get ETH balance of a specific address.
   */
  async getBalance(address: string): Promise<string> {
    if (!this.provider) return "0";
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch {
      return "0";
    }
  }

  /**
   * Create a tender on the Ganache blockchain.
   * Returns transaction data including hash and block number.
   */
  async createTenderOnChain(params: {
    title: string;
    ipfsHash: string;
    budget: number;
    deadline: number;
    minScore: number;
    msmeQuota: boolean;
  }): Promise<{ txHash: string; blockNumber: number; tenderId?: number } | null> {
    if (!this.contract || !this.officerWallet) {
      logger.warn("Contract not deployed - returning simulated tx");
      return null;
    }

    try {
      const tx = await this.contract.createTender(
        params.title,
        params.ipfsHash,
        ethers.parseEther(params.budget.toString()),
        params.deadline,
        params.minScore * 100, // Convert to basis points
        params.msmeQuota
      );
      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      logger.error("❌ On-chain tender creation failed:", error.message);
      return null;
    }
  }

  /**
   * Listen for new blocks on Ganache (for real-time updates).
   */
  onNewBlock(callback: (blockNumber: number) => void): void {
    if (!this.provider) return;
    this.provider.on("block", (blockNumber: number) => {
      callback(blockNumber);
    });
  }

  /**
   * Listen for TenderCreated events from the contract.
   */
  onTenderCreated(callback: (tenderId: number, officer: string, title: string) => void): void {
    if (!this.contract) return;
    this.contract.on("TenderCreated", (tenderId: bigint, officer: string, title: string) => {
      callback(Number(tenderId), officer, title);
    });
  }

  /**
   * Listen for BidSubmitted events from the contract.
   */
  onBidSubmitted(callback: (tenderId: number, bidder: string, hash: string) => void): void {
    if (!this.contract) return;
    this.contract.on("BidSubmitted", (tenderId: bigint, bidder: string, encryptedBidHash: string) => {
      callback(Number(tenderId), bidder, encryptedBidHash);
    });
  }
}

// Singleton instance - shared across the entire app
export const blockchainService = new GanacheBlockchainService();