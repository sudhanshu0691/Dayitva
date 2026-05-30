"use strict";
// ============================================================
// Multi-Criteria Scoring Service
// Evaluates vendor bids using weighted scoring formula
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBidScore = calculateBidScore;
exports.determineWinner = determineWinner;
/**
 * Weight constants for the scoring formula.
 * Total = 100%
 */
const WEIGHTS = {
    PRICE: 0.40, // 40%
    FINANCIAL_STRENGTH: 0.15, // 15%
    PAST_EXPERIENCE: 0.15, // 15%
    PERFORMANCE_FEEDBACK: 0.10, // 10%
    TECHNICAL_CAPABILITY: 0.10, // 10%
    COMPLIANCE: 0.05, // 5%
    PROPOSAL_QUALITY: 0.05, // 5%
};
/**
 * Compute the normalized price score.
 * The lowest bid gets 100, others get proportional scores.
 *
 * Formula: (lowestBid / currentBid) * 100
 */
function computePriceScore(price, budget) {
    if (price <= 0 || budget <= 0)
        return 0;
    // Price score based on how competitive the bid is
    // If price is within 80-100% of budget, score is high
    const ratio = price / budget;
    if (ratio <= 1) {
        // Below or at budget - good
        return Math.round((1 - (ratio * 0.5)) * 100);
    }
    else {
        // Above budget - penalty
        return Math.round(Math.max(0, (1 - (ratio - 1) * 2)) * 100);
    }
}
/**
 * Calculate the weighted total score for a bid.
 *
 * Scoring Formula:
 *   Total = (priceScore × 40%) + (financialStrength × 15%)
 *         + (pastExperience × 15%) + (performanceFeedback × 10%)
 *         + (technicalCapability × 10%) + (compliance × 5%)
 *         + (proposalQuality × 5%)
 */
function calculateBidScore(params) {
    // Validate input ranges
    const clamp = (value) => Math.min(100, Math.max(0, value));
    const priceScore = computePriceScore(params.price, params.budget);
    const financialStrength = clamp(params.financialStrength);
    const pastExperience = clamp(params.pastExperience);
    const performanceFeedback = clamp(params.performanceFeedback);
    const technicalCapability = clamp(params.technicalCapability);
    const compliance = clamp(params.compliance);
    const proposalQuality = clamp(params.proposalQuality);
    // Calculate weighted total
    const totalScore = priceScore * WEIGHTS.PRICE +
        financialStrength * WEIGHTS.FINANCIAL_STRENGTH +
        pastExperience * WEIGHTS.PAST_EXPERIENCE +
        performanceFeedback * WEIGHTS.PERFORMANCE_FEEDBACK +
        technicalCapability * WEIGHTS.TECHNICAL_CAPABILITY +
        compliance * WEIGHTS.COMPLIANCE +
        proposalQuality * WEIGHTS.PROPOSAL_QUALITY;
    return {
        priceScore: Math.round(priceScore * 100) / 100,
        financialStrength,
        pastExperience,
        performanceFeedback,
        technicalCapability,
        compliance,
        proposalQuality,
        totalScore: Math.round(totalScore * 100) / 100,
    };
}
/**
 * Determine the winner among revealed bids.
 * Returns the bid with the highest total score.
 * In case of a tie, the earlier bid wins (first-submitted).
 */
function determineWinner(bids) {
    if (bids.length === 0)
        return null;
    // Sort by totalScore desc, then by submittedAt asc (earliest wins ties)
    const sorted = [...bids].sort((a, b) => {
        if (b.totalScore !== a.totalScore)
            return b.totalScore - a.totalScore;
        return a.submittedAt.getTime() - b.submittedAt.getTime();
    });
    const winner = sorted[0];
    return {
        winnerId: winner.vendorId,
        winnerName: winner.vendorName,
        winnerAddress: winner.vendorAddress,
        winnerPrice: winner.price,
        winnerScore: winner.totalScore,
    };
}
//# sourceMappingURL=scoring.service.js.map