import { CreateTenderInput, UpdateTenderInput, TenderQueryInput } from "../validators/tender.validator";
import { ITender } from "../types";
/**
 * Create a new tender (Officer only).
 * txHash is provided from MetaMask - the frontend handles the real blockchain transaction
 */
export declare function createTender(input: CreateTenderInput & {
    txHash?: string;
    blockNumber?: number;
}, officerId: string): Promise<ITender>;
/**
 * Get tender by ID with full details.
 */
export declare function getTenderById(tenderId: string): Promise<ITender>;
/**
 * List tenders with filtering, search, and pagination.
 */
export declare function listTenders(query: TenderQueryInput): Promise<{
    data: {
        id: string;
        title: string;
        description: string;
        ministry: string;
        budget: number;
        deadline: string;
        status: import(".prisma/client").$Enums.TenderStatus;
        msmeQuota: boolean;
        ipfsHash: string | undefined;
        txHash: string | undefined;
        blockNumber: number | undefined;
        createdAt: string;
        bidsCount: number;
        winnerAddress: string | undefined;
        winnerName: string | undefined;
        isNew: boolean;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
/**
 * Update a tender (Officer only, before deadline).
 */
export declare function updateTender(tenderId: string, input: UpdateTenderInput, officerId: string): Promise<ITender>;
/**
 * Change tender status (Officer only).
 */
export declare function updateTenderStatus(tenderId: string, status: string, officerId: string): Promise<ITender>;
/**
 * Delete a tender (Officer only, only if no bids).
 */
export declare function deleteTender(tenderId: string, officerId: string): Promise<void>;
//# sourceMappingURL=tender.service.d.ts.map