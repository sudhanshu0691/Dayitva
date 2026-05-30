import { SubmitBidInput, RevealBidInput } from "../validators/bid.validator";
/**
 * Submit an encrypted bid (commit phase).
 * Vendor submits a hash of their bid parameters.
 */
export declare function submitBid(tenderId: string, input: SubmitBidInput, vendorId: string): Promise<{
    id: string;
    tenderId: string;
    vendorName: string;
    vendorAddress: string;
    price: number | undefined;
    isEncrypted: boolean;
    submittedAt: string;
    txHash: string | undefined;
    blockNumber: number | undefined;
}>;
/**
 * Reveal a bid after the deadline (reveal phase).
 * Vendor reveals price and scoring parameters.
 */
export declare function revealBid(tenderId: string, input: RevealBidInput, vendorId: string): Promise<{
    priceScore: number;
    financialStrength: number;
    pastExperience: number;
    performanceFeedback: number;
    technicalCapability: number;
    compliance: number;
    proposalQuality: number;
    totalScore: number;
    id: string;
    tenderId: string;
    vendorName: string;
    vendorAddress: string;
    price: number | undefined;
    isEncrypted: boolean;
    submittedAt: string;
    txHash: string | undefined;
    blockNumber: number | undefined;
}>;
/**
 * Get all bids for a tender (Officer only).
 */
export declare function getTenderBids(tenderId: string, officerId: string): Promise<{
    id: string;
    tenderId: string;
    vendorName: string;
    vendorAddress: string;
    price: number | undefined;
    isEncrypted: boolean;
    submittedAt: string;
    txHash: string | undefined;
    blockNumber: number | undefined;
    priceScore: number | undefined;
    financialStrength: number | undefined;
    pastExperience: number | undefined;
    performanceFeedback: number | undefined;
    technicalCapability: number | undefined;
    compliance: number | undefined;
    proposalQuality: number | undefined;
    totalScore: number | undefined;
}[]>;
/**
 * Evaluate a tender after all bids are revealed.
 * Calculates final scores and declares winner.
 */
export declare function evaluateTender(tenderId: string, officerId: string): Promise<{
    winner: {
        winnerId: string;
        winnerName: string;
        winnerAddress: string;
        winnerPrice: number;
        winnerScore: number;
    };
    txHash: string | null;
    blockNumber: number | null;
}>;
//# sourceMappingURL=bid.service.d.ts.map