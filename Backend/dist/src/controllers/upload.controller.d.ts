import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
/**
 * POST /api/uploads/ipfs
 * Upload files to IPFS
 */
export declare function uploadToIPFS(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/uploads/s3
 * Upload files to AWS S3
 */
export declare function uploadToS3(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/uploads/:hash
 * Get file from IPFS by hash
 */
export declare function getIPFSFile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/uploads/:hash
 * Delete file from S3
 */
export declare function deleteS3File(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=upload.controller.d.ts.map