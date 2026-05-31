// ============================================================
// Upload Routes
// All routes related to file uploads
// ============================================================

import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";
import multer from "multer";
import path from "path";
import os from "os";
import fs from "fs";

const router = Router();

// Ensure temp directory exists
const tempDir = path.join(os.tmpdir(), "tenderchain-uploads");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for file uploads - use diskStorage for file.path compatibility
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPEG, PNG, GIF") as any, false);
    }
  },
});

/**
 * POST /api/uploads/ipfs
 * Upload files to IPFS
 */
router.post(
  "/ipfs",
  authenticate,
  upload.array("files", 5),
  uploadController.uploadToIPFS
);

/**
 * POST /api/uploads/s3
 * Upload files to AWS S3
 */
router.post(
  "/s3",
  authenticate,
  upload.array("files", 5),
  uploadController.uploadToS3
);

/**
 * GET /api/uploads/:hash
 * Get file from IPFS
 */
router.get("/:hash", uploadController.getIPFSFile);

/**
 * DELETE /api/uploads/:hash
 * Delete file from S3
 */
router.delete("/:hash", authenticate, uploadController.deleteS3File);

export default router;