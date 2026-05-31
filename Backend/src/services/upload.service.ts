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

function encodeObjectKeyForUrl(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildObjectPublicUrl(key: string): string {
  const encodedKey = encodeObjectKeyForUrl(key);

  if (env.AWS_S3_PUBLIC_URL) {
    return `${env.AWS_S3_PUBLIC_URL.replace(/\/$/, "")}/${encodedKey}`;
  }

  if (env.AWS_S3_ENDPOINT) {
    const endpoint = new URL(env.AWS_S3_ENDPOINT);
    if (env.AWS_S3_FORCE_PATH_STYLE) {
      return `${endpoint.origin}/${env.AWS_S3_BUCKET}/${encodedKey}`;
    }
    return `${endpoint.protocol}//${env.AWS_S3_BUCKET}.${endpoint.host}/${encodedKey}`;
  }

  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${encodedKey}`;
}

const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_S3_ENDPOINT || undefined,
  forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    sessionToken: env.AWS_SESSION_TOKEN || undefined,
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

      const url = buildObjectPublicUrl(fileName);
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
    } catch (error: any) {
      const details = {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        awsRequestId: error?.$metadata?.requestId,
        awsExtendedRequestId: error?.$metadata?.extendedRequestId,
        httpStatusCode: error?.$metadata?.httpStatusCode,
        bucket: env.AWS_S3_BUCKET,
        region: env.AWS_REGION,
        endpoint: env.AWS_S3_ENDPOINT || "aws-default",
        forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
        hasSessionToken: Boolean(env.AWS_SESSION_TOKEN),
      };

      logger.error(`S3 upload error for ${file.originalname}`, details);

      if ((error?.message || "").includes("The request signature we calculated does not match")) {
        throw new AppError(
          "S3 signature mismatch. Check AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN (if temporary creds), and AWS_S3_ENDPOINT/path-style settings.",
          500
        );
      }

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
  } catch (error: any) {
    logger.error(`S3 delete error for ${fileKey}`, {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      awsRequestId: error?.$metadata?.requestId,
      awsExtendedRequestId: error?.$metadata?.extendedRequestId,
      httpStatusCode: error?.$metadata?.httpStatusCode,
      bucket: env.AWS_S3_BUCKET,
      region: env.AWS_REGION,
      endpoint: env.AWS_S3_ENDPOINT || "aws-default",
      forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
      hasSessionToken: Boolean(env.AWS_SESSION_TOKEN),
    });
    throw new AppError("Failed to delete file from S3", 500);
  }
}
