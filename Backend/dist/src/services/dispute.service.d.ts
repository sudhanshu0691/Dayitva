/**
 * Create a new dispute
 */
export declare function createDispute(tenderId: string, userId: string, text: string, category?: string): Promise<{
    user: {
        id: string;
        name: string;
        role: string;
        email: string;
    };
    tender: {
        title: string;
        ministry: string | null;
    };
    id: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    entityId: string | null;
    entityType: string | null;
    text: string;
}>;
/**
 * Get dispute by ID
 */
export declare function getDisputeById(disputeId: string): Promise<{
    user: any;
    tender: {
        id: string;
        title: string;
        ministry: string | null;
    };
    id: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    entityId: string | null;
    entityType: string | null;
    text: string;
}>;
/**
 * Get disputes for a tender
 */
export declare function getDisputesByTender(tenderId: string): Promise<{
    user: any;
    id: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    entityId: string | null;
    entityType: string | null;
    text: string;
}[]>;
/**
 * Update dispute status
 */
export declare function updateDisputeStatus(disputeId: string, status: string, resolution: string): Promise<{
    user: any;
    tender: {
        title: string;
    };
    id: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    entityId: string | null;
    entityType: string | null;
    text: string;
}>;
/**
 * List disputes with filters
 */
export declare function listDisputes(query: any): Promise<{
    data: {
        user: any;
        tender: {
            id: string;
            title: string;
        };
        id: string;
        status: import(".prisma/client").$Enums.DisputeStatus;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        entityId: string | null;
        entityType: string | null;
        text: string;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
//# sourceMappingURL=dispute.service.d.ts.map