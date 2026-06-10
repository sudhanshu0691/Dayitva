/**
 * Get officer dashboard statistics
 */
export declare function getOfficerDashboard(officerId: string): Promise<{
    summary: {
        totalTenders: number;
        openTenders: number;
        closedTenders: number;
        totalBids: number;
        disputes: number;
    };
    recentTenders: {
        id: string;
        title: string;
        deadline: Date;
        status: import(".prisma/client").$Enums.TenderStatus;
        createdAt: Date;
    }[];
    recentBids: {
        vendor: {
            name: string;
            companyName: string | null;
        };
        id: string;
        status: import(".prisma/client").$Enums.BidStatus;
        tenderId: string;
        submittedAt: Date;
        price: number | null;
    }[];
}>;
/**
 * Get vendor dashboard statistics
 */
export declare function getVendorDashboard(vendorId: string): Promise<{
    summary: {
        totalBids: number;
        winningBids: number;
        activeBids: number;
        kycStatus: import(".prisma/client").$Enums.KYCStatus;
    };
    recentBids: ({
        tender: {
            id: string;
            title: string;
            deadline: Date;
            status: import(".prisma/client").$Enums.TenderStatus;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BidStatus;
        txHash: string | null;
        blockNumber: number | null;
        tenderId: string;
        vendorId: string;
        submittedAt: Date;
        encryptedBidHash: string | null;
        price: number | null;
        financialStrength: number | null;
        pastExperience: number | null;
        performanceFeedback: number | null;
        technicalCapability: number | null;
        compliance: number | null;
        proposalQuality: number | null;
        totalScore: number | null;
        bidHash: string | null;
        priceScore: number | null;
        revealedAt: Date | null;
    })[];
    availableTenders: {
        id: string;
        title: string;
        budget: number;
        deadline: Date;
        ministry: string | null;
    }[];
}>;
/**
 * Get system-wide analytics
 */
export declare function getAnalytics(): Promise<{
    users: {
        total: number;
        vendors: number;
        officers: number;
    };
    tenders: {
        total: number;
        byStatus: {
            status: any;
            count: any;
        }[];
    };
    bids: {
        total: number;
        byStatus: {
            status: any;
            count: any;
        }[];
    };
    disputes: {
        total: number;
    };
}>;
/**
 * Get tender reports
 */
export declare function getTenderReports(query: any): Promise<{
    data: {
        id: string;
        title: string;
        budget: number;
        deadline: Date;
        status: import(".prisma/client").$Enums.TenderStatus;
        ministry: string | null;
        createdAt: Date;
        _count: {
            bids: number;
        };
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get bid reports
 */
export declare function getBidReports(query: any): Promise<{
    data: ({
        vendor: {
            name: string;
            companyName: string | null;
        };
        tender: {
            title: string;
            budget: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BidStatus;
        txHash: string | null;
        blockNumber: number | null;
        tenderId: string;
        vendorId: string;
        submittedAt: Date;
        encryptedBidHash: string | null;
        price: number | null;
        financialStrength: number | null;
        pastExperience: number | null;
        performanceFeedback: number | null;
        technicalCapability: number | null;
        compliance: number | null;
        proposalQuality: number | null;
        totalScore: number | null;
        bidHash: string | null;
        priceScore: number | null;
        revealedAt: Date | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
/**
 * Get KYC reports
 */
export declare function getKYCReports(query: any): Promise<{
    data: {
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        companyName: string | null;
        pan: string | null;
        gst: string | null;
        kycStatus: import(".prisma/client").$Enums.KYCStatus;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
//# sourceMappingURL=dashboard.service.d.ts.map