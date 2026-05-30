export declare const env: {
    readonly PORT: number;
    readonly NODE_ENV: string;
    readonly FRONTEND_URL: string;
    readonly DATABASE_URL: string;
    readonly JWT_SECRET: string;
    readonly JWT_REFRESH_SECRET: string;
    readonly JWT_ACCESS_EXPIRY: string;
    readonly JWT_REFRESH_EXPIRY: string;
    readonly PINATA_API_KEY: string;
    readonly PINATA_SECRET_KEY: string;
    readonly AWS_ACCESS_KEY_ID: string;
    readonly AWS_SECRET_ACCESS_KEY: string;
    readonly AWS_REGION: string;
    readonly AWS_S3_BUCKET: string;
    readonly ETH_RPC_URL: string;
    readonly ETH_CHAIN_ID: number;
    readonly CONTRACT_ADDRESS: string;
    readonly OFFICER_PRIVATE_KEY: string;
    readonly VENDOR_PRIVATE_KEY: string;
    readonly BLOCKCHAIN_SIMULATION_MODE: boolean;
    readonly SOCKET_CORS_ORIGIN: string;
    readonly LOG_LEVEL: string;
};
export declare function validateEnv(): void;
//# sourceMappingURL=env.d.ts.map