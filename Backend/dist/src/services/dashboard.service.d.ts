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
        status: import(".prisma/client").$Enums.TenderStatus;
        id: string;
        createdAt: Date;
        title: string;
        deadline: Date;
    }[];
    recentBids: {
        vendor: {
            name: string;
            companyName: string | null;
        };
        status: import(".prisma/client").$Enums.BidStatus;
        id: string;
        submittedAt: Date;
        tenderId: string;
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
            status: import(".prisma/client").$Enums.TenderStatus;
            id: string;
            title: string;
            deadline: Date;
        };
    } & {
        status: import(".prisma/client").$Enums.BidStatus;
        id: string;
        vendorId: string;
        txHash: string | null;
        blockNumber: number | null;
        submittedAt: Date;
        tenderId: string;
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
        ministry: string | null;
        id: string;
        title: string;
        budget: number;
        deadline: Date;
    }[];
}>;
/**
 * Get system-wide analytics
 */
export declare function getAnalytics(): Promise<{
    users: {
        total: number;
        officers: number;
        vendors: number;
    };
    tenders: {
        total: number;
        byStatus: {
            status: import(".prisma/client").$Enums.TenderStatus;
            count: number;
        }[];
    };
    bids: {
        total: number;
        byStatus: {
            status: import(".prisma/client").$Enums.BidStatus;
            count: number;
        }[];
    };
    kyc: {
        byStatus: {
            status: import(".prisma/client").$Enums.KYCStatus;
            count: number;
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
        status: import(".prisma/client").$Enums.TenderStatus;
        ministry: string | null;
        id: string;
        createdAt: Date;
        title: string;
        budget: number;
        deadline: Date;
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
        tender: {
            title: string;
            budget: number;
        };
        vendor: {
            name: string;
            companyName: string | null;
        };
    } & {
        status: import(".prisma/client").$Enums.BidStatus;
        id: string;
        vendorId: string;
        txHash: string | null;
        blockNumber: number | null;
        submittedAt: Date;
        tenderId: string;
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
        name: string;
        email: string;
        companyName: string | null;
        pan: string | null;
        gst: string | null;
        kycStatus: import(".prisma/client").$Enums.KYCStatus;
        id: string;
        createdAt: Date;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
//# sourceMappingURL=dashboard.service.d.ts.map