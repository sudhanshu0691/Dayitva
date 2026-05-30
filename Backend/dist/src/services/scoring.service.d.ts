import { IBidScoreParams, IBidScoreResult } from "../types";
/**
 * Calculate the weighted total score for a bid.
 *
 * Scoring Formula:
 *   Total = (priceScore × 40%) + (financialStrength × 15%)
 *         + (pastExperience × 15%) + (performanceFeedback × 10%)
 *         + (technicalCapability × 10%) + (compliance × 5%)
 *         + (proposalQuality × 5%)
 */
export declare function calculateBidScore(params: IBidScoreParams): IBidScoreResult;
/**
 * Determine the winner among revealed bids.
 * Returns the bid with the highest total score.
 * In case of a tie, the earlier bid wins (first-submitted).
 */
export declare function determineWinner(bids: Array<{
    id: string;
    vendorId: string;
    vendorName: string;
    vendorAddress: string;
    totalScore: number;
    price: number;
    submittedAt: Date;
}>): {
    winnerId: string;
    winnerName: string;
    winnerAddress: string;
    winnerPrice: number;
    winnerScore: number;
} | null;
//# sourceMappingURL=scoring.service.d.ts.map