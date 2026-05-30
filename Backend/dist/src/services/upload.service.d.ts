/**
 * Upload files to IPFS via Pinata
 */
export declare function uploadToIPFS(files: any[], userId?: string): Promise<{
    hashes: string[];
    files: any[];
}>;
/**
 * Upload files to AWS S3
 */
export declare function uploadToS3(files: any[], userId?: string): Promise<{
    urls: string[];
    files: any[];
}>;
/**
 * Get IPFS file information
 */
export declare function getIPFSFile(hash: string): Promise<{
    hash: string;
    url: string;
    gateway: string;
}>;
/**
 * Delete file from S3
 */
export declare function deleteS3File(fileKey: string): Promise<void>;
//# sourceMappingURL=upload.service.d.ts.map