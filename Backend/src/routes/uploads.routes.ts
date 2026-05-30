// ============================================================
// Upload Routes
// All routes related to file uploads
// ============================================================

import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";
import multer from "multer";
import path from "path";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
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
      cb(null, false);
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
