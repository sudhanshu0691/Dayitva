/**
 * Generate an explorer URL for a transaction (Ganache has no native explorer)
 */
export declare function getExplorerTxUrl(txHash: string): string;
/**
 * Generate an explorer URL for an address
 */
export declare function getExplorerAddressUrl(address: string): string;
/**
 * Store a blockchain transaction record after MetaMask confirmation
 */
export declare function storeTransaction(params: {
    txHash: string;
    walletAddress: string;
    type: string;
    status?: string;
    metadata?: Record<string, any>;
    tenderId?: string;
    userId?: string;
    chainId?: number;
}): Promise<any>;
/**
 * Update transaction status after MetaMask confirmation
 */
export declare function updateTransactionStatus(txHash: string, status: string): Promise<void>;
/**
 * Verify a transaction exists on Ganache
 */
export declare function verifyTransactionOnChain(txHash: string): Promise<{
    verified: boolean;
    blockNumber?: number;
    from?: string;
    to?: string;
}>;
/**
 * Get the current gas price on Ganache
 */
export declare function getGasPrice(): Promise<string>;
/**
 * Check if the Ganache network is reachable
 */
export declare function isBlockchainReachable(): Promise<boolean>;
/**
 * Get contract ABI for frontend MetaMask interactions
 */
export declare function getContractABI(): string[];
declare const _default: {
    getExplorerTxUrl: typeof getExplorerTxUrl;
    getExplorerAddressUrl: typeof getExplorerAddressUrl;
    storeTransaction: typeof storeTransaction;
    updateTransactionStatus: typeof updateTransactionStatus;
    verifyTransactionOnChain: typeof verifyTransactionOnChain;
    getGasPrice: typeof getGasPrice;
    isBlockchainReachable: typeof isBlockchainReachable;
    getContractABI: typeof getContractABI;
};
export default _default;
//# sourceMappingURL=blockchain.service.d.ts.map