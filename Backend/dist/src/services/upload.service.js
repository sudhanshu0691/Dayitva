"use strict";
// ============================================================
// Upload Service
// Business logic for file uploads to IPFS and S3
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToIPFS = uploadToIPFS;
exports.uploadToS3 = uploadToS3;
exports.getIPFSFile = getIPFSFile;
exports.deleteS3File = deleteS3File;
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const s3Client = new client_s3_1.S3Client({
    region: env_1.env.AWS_REGION,
    credentials: {
        accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
    },
});
/**
 * Upload files to IPFS via Pinata
 */
async function uploadToIPFS(files, userId) {
    if (!env_1.env.PINATA_API_KEY || !env_1.env.PINATA_SECRET_KEY) {
        throw new errorHandler_1.AppError("IPFS upload not configured", 500);
    }
    const hashes = [];
    const uploadedFiles = [];
    for (const file of files) {
        try {
            const formData = new form_data_1.default();
            formData.append("file", fs_1.default.createReadStream(file.path));
            const response = await (0, node_fetch_1.default)("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                method: "POST",
                headers: {
                    pinata_api_key: env_1.env.PINATA_API_KEY,
                    pinata_secret_api_key: env_1.env.PINATA_SECRET_KEY,
                },
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`IPFS upload failed: ${response.statusText}`);
            }
            const data = await response.json();
            hashes.push(data.IpfsHash);
            uploadedFiles.push({
                name: file.originalname,
                size: `${(file.size / 1024).toFixed(2)}KB`,
                hash: data.IpfsHash,
                uploadedAt: new Date().toISOString(),
            });
            logger_1.logger.info(`File uploaded to IPFS: ${file.originalname} -> ${data.IpfsHash}`);
            // Clean up temp file
            fs_1.default.unlinkSync(file.path);
        }
        catch (error) {
            logger_1.logger.error(`IPFS upload error for ${file.originalname}`, { error });
            throw new errorHandler_1.AppError("Failed to upload file to IPFS", 500);
        }
    }
    return {
        hashes,
        files: uploadedFiles,
    };
}
/**
 * Upload files to AWS S3
 */
async function uploadToS3(files, userId) {
    if (!env_1.env.AWS_ACCESS_KEY_ID || !env_1.env.AWS_SECRET_ACCESS_KEY) {
        throw new errorHandler_1.AppError("S3 upload not configured", 500);
    }
    const urls = [];
    const uploadedFiles = [];
    for (const file of files) {
        try {
            const fileContent = fs_1.default.readFileSync(file.path);
            const fileName = `${userId || "public"}/${Date.now()}-${file.originalname}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: env_1.env.AWS_S3_BUCKET,
                Key: fileName,
                Body: fileContent,
                ContentType: file.mimetype,
            });
            await s3Client.send(command);
            const url = `https://${env_1.env.AWS_S3_BUCKET}.s3.${env_1.env.AWS_REGION}.amazonaws.com/${fileName}`;
            urls.push(url);
            uploadedFiles.push({
                name: file.originalname,
                size: `${(file.size / 1024).toFixed(2)}KB`,
                url,
                key: fileName,
                uploadedAt: new Date().toISOString(),
            });
            logger_1.logger.info(`File uploaded to S3: ${file.originalname} -> ${url}`);
            // Clean up temp file
            fs_1.default.unlinkSync(file.path);
        }
        catch (error) {
            logger_1.logger.error(`S3 upload error for ${file.originalname}`, { error });
            throw new errorHandler_1.AppError("Failed to upload file to S3", 500);
        }
    }
    return {
        urls,
        files: uploadedFiles,
    };
}
/**
 * Get IPFS file information
 */
async function getIPFSFile(hash) {
    // This would typically interact with an IPFS gateway
    // For now, returning mock data
    const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
    return {
        hash,
        url,
        gateway: "pinata",
    };
}
/**
 * Delete file from S3
 */
async function deleteS3File(fileKey) {
    try {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: env_1.env.AWS_S3_BUCKET,
            Key: fileKey,
        });
        await s3Client.send(command);
        logger_1.logger.info(`File deleted from S3: ${fileKey}`);
    }
    catch (error) {
        logger_1.logger.error(`S3 delete error for ${fileKey}`, { error });
        throw new errorHandler_1.AppError("Failed to delete file from S3", 500);
    }
}
//# sourceMappingURL=upload.service.js.map