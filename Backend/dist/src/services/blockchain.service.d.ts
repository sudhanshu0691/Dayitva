import { ethers } from "ethers";
/**
 * Manages all blockchain interactions with local Ganache network.
 * Supports two separate wallet accounts:
 *   - Officer Wallet: for creating tenders on-chain
 *   - Vendor Wallet: for submitting bids on-chain
 * MetaMask users connect their own wallets via the frontend.
 */
declare class GanacheBlockchainService {
    provider: ethers.JsonRpcProvider | null;
    officerWallet: ethers.Wallet | null;
    vendorWallet: ethers.Wallet | null;
    contract: ethers.Contract | null;
    isConnected: boolean;
    /**
     * Initialize connection to local Ganache.
     * @returns true if connection successful, false otherwise
     */
    connect(): Promise<boolean>;
    /**
     * Generate a unique transaction hash (for simulation mode).
     */
    generateTxHash(): string;
    /**
     * Generate a simulated block number.
     */
    generateBlockNumber(): number;
    /**
     * Get all Ganache accounts from the provider.
     */
    getAccounts(): Promise<string[]>;
    /**
     * Get ETH balance of a specific address.
     */
    getBalance(address: string): Promise<string>;
    /**
     * Create a tender on the Ganache blockchain.
     * Returns transaction data including hash and block number.
     */
    createTenderOnChain(params: {
        title: string;
        ipfsHash: string;
        budget: number;
        deadline: number;
        minScore: number;
        msmeQuota: boolean;
    }): Promise<{
        txHash: string;
        blockNumber: number;
        tenderId?: number;
    } | null>;
    /**
     * Listen for new blocks on Ganache (for real-time updates).
     */
    onNewBlock(callback: (blockNumber: number) => void): void;
    /**
     * Listen for TenderCreated events from the contract.
     */
    onTenderCreated(callback: (tenderId: number, officer: string, title: string) => void): void;
    /**
     * Listen for BidSubmitted events from the contract.
     */
    onBidSubmitted(callback: (tenderId: number, bidder: string, hash: string) => void): void;
}
export declare const blockchainService: GanacheBlockchainService;
export {};
//# sourceMappingURL=blockchain.service.d.ts.map