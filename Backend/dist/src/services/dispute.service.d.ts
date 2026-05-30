/**
 * Create a new dispute
 */
export declare function createDispute(tenderId: string, userId: string, text: string, category?: string): Promise<{
    user: {
        name: string;
        email: string;
        id: string;
    };
    tender: {
        ministry: string | null;
        title: string;
    };
} & {
    userId: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    text: string;
}>;
/**
 * Get dispute by ID
 */
export declare function getDisputeById(disputeId: string): Promise<{
    user: {
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        email: string;
        id: string;
    };
    tender: {
        ministry: string | null;
        id: string;
        title: string;
    };
} & {
    userId: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    text: string;
}>;
/**
 * Get disputes for a tender
 */
export declare function getDisputesByTender(tenderId: string): Promise<({
    user: {
        name: string;
        email: string;
        id: string;
    };
} & {
    userId: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    text: string;
})[]>;
/**
 * Update dispute status
 */
export declare function updateDisputeStatus(disputeId: string, status: string, resolution: string): Promise<{
    user: {
        name: string;
        email: string;
        id: string;
    };
    tender: {
        title: string;
    };
} & {
    userId: string;
    status: import(".prisma/client").$Enums.DisputeStatus;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tenderId: string;
    text: string;
}>;
/**
 * List disputes with filters
 */
export declare function listDisputes(query: any): Promise<{
    data: ({
        user: {
            name: string;
            email: string;
            id: string;
        };
        tender: {
            id: string;
            title: string;
        };
    } & {
        userId: string;
        status: import(".prisma/client").$Enums.DisputeStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenderId: string;
        text: string;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
//# sourceMappingURL=dispute.service.d.ts.map