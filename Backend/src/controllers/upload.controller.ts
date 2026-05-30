// ============================================================
// Upload Controller
// Handles file uploads to IPFS and AWS S3
// ============================================================

import { Response, NextFunction } from "express";
import * as uploadService from "../services/upload.service";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

/**
 * POST /api/uploads/ipfs
 * Upload files to IPFS
 */
export async function uploadToIPFS(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: "No file(s) provided",
      });
    }

    const files = Array.isArray(req.files)
      ? req.files
      : req.file
        ? [req.file]
        : [];
    const result = await uploadService.uploadToIPFS(files, req.user?.userId);

    logger.info(`Files uploaded to IPFS: ${result.hashes.join(", ")}`);
    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/uploads/s3
 * Upload files to AWS S3
 */
export async function uploadToS3(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: "No file(s) provided",
      });
    }

    const files = Array.isArray(req.files)
      ? req.files
      : req.file
        ? [req.file]
        : [];
    const result = await uploadService.uploadToS3(files, req.user?.userId);

    logger.info(`Files uploaded to S3: ${result.urls.join(", ")}`);
    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/uploads/:hash
 * Get file from IPFS by hash
 */
export async function getIPFSFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = await uploadService.getIPFSFile(req.params.hash as string);
    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/uploads/:hash
 * Delete file from S3
 */
export async function deleteS3File(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await uploadService.deleteS3File(req.params.hash as string);
    logger.info(`File deleted from S3: ${req.params.hash}`);
    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
