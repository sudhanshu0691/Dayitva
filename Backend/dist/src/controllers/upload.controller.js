"use strict";
// ============================================================
// Upload Controller
// Handles file uploads to IPFS and AWS S3
// ============================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToIPFS = uploadToIPFS;
exports.uploadToS3 = uploadToS3;
exports.getIPFSFile = getIPFSFile;
exports.deleteS3File = deleteS3File;
const uploadService = __importStar(require("../services/upload.service"));
const logger_1 = require("../utils/logger");
/**
 * POST /api/uploads/ipfs
 * Upload files to IPFS
 */
async function uploadToIPFS(req, res, next) {
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
        logger_1.logger.info(`Files uploaded to IPFS: ${result.hashes.join(", ")}`);
        res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/uploads/s3
 * Upload files to AWS S3
 */
async function uploadToS3(req, res, next) {
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
        logger_1.logger.info(`Files uploaded to S3: ${result.urls.join(", ")}`);
        res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/uploads/:hash
 * Get file from IPFS by hash
 */
async function getIPFSFile(req, res, next) {
    try {
        const file = await uploadService.getIPFSFile(req.params.hash);
        res.status(200).json({
            success: true,
            data: file,
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/uploads/:hash
 * Delete file from S3
 */
async function deleteS3File(req, res, next) {
    try {
        await uploadService.deleteS3File(req.params.hash);
        logger_1.logger.info(`File deleted from S3: ${req.params.hash}`);
        res.status(200).json({
            success: true,
            message: "File deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=upload.controller.js.map