// ============================================================
// Upload Service
// Business logic for file uploads to IPFS and S3
// ============================================================

import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload files to IPFS via Pinata
 */
export async function uploadToIPFS(files: any[], userId?: string) {
  if (!env.PINATA_API_KEY || !env.PINATA_SECRET_KEY) {
    throw new AppError("IPFS upload not configured", 500);
  }

  const hashes: string[] = [];
  const uploadedFiles: any[] = [];

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(file.path));

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          pinata_api_key: env.PINATA_API_KEY,
          pinata_secret_api_key: env.PINATA_SECRET_KEY,
        },
        body: formData as any,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const data: any = await response.json();
      hashes.push(data.IpfsHash);
      uploadedFiles.push({
        name: file.originalname,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        hash: data.IpfsHash,
        uploadedAt: new Date().toISOString(),
      });

      logger.info(`File uploaded to IPFS: ${file.originalname} -> ${data.IpfsHash}`);

      // Clean up temp file
      fs.unlinkSync(file.path);
    } catch (error) {
      logger.error(`IPFS upload error for ${file.originalname}`, { error });
      throw new AppError("Failed to upload file to IPFS", 500);
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
export async function uploadToS3(files: any[], userId?: string) {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new AppError("S3 upload not configured", 500);
  }

  const urls: string[] = [];
  const uploadedFiles: any[] = [];

  for (const file of files) {
    try {
      const fileContent = fs.readFileSync(file.path);
      const fileName = `${userId || "public"}/${Date.now()}-${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileContent,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);

      const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
      urls.push(url);
      uploadedFiles.push({
        name: file.originalname,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        url,
        key: fileName,
        uploadedAt: new Date().toISOString(),
      });

      logger.info(`File uploaded to S3: ${file.originalname} -> ${url}`);

      // Clean up temp file
      fs.unlinkSync(file.path);
    } catch (error) {
      logger.error(`S3 upload error for ${file.originalname}`, { error });
      throw new AppError("Failed to upload file to S3", 500);
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
export async function getIPFSFile(hash: string) {
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
export async function deleteS3File(fileKey: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: fileKey,
    });

    await s3Client.send(command);
    logger.info(`File deleted from S3: ${fileKey}`);
  } catch (error) {
    logger.error(`S3 delete error for ${fileKey}`, { error });
    throw new AppError("Failed to delete file from S3", 500);
  }
}
