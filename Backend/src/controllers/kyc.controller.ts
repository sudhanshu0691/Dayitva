// ============================================================
// KYC Controller
// Handles KYC document upload, status tracking, and
// Auditor review workflow
// ============================================================

import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as kycService from "../services/kyc.service";

export async function submitKYC(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { documents, documentTypes } = req.body;
    const userId = req.user!.userId;
    const userType = req.user!.role === "officer" ? "officer" : "vendor";

    if (!documents || !documentTypes || !Array.isArray(documents) || !Array.isArray(documentTypes)) {
      return res.status(400).json({ error: "documents and documentTypes must be arrays" });
    }

    const result = await kycService.submitKYC(userId, userType, documents, documentTypes);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getKYCStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const status = await kycService.getKYCStatus(userId);
    res.json(status);
  } catch (error) {
    next(error);
  }
}

export async function getPendingKYC(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const requests = await kycService.getPendingKYCRequests();
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

export async function getAllKYC(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const requests = await kycService.getAllKYCRequests(status as string);
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

export async function approveKYC(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const requestId = req.params.requestId as string;
    const { remarks } = req.body;
    const auditorId = req.user!.userId;

    const result = await kycService.approveKYC(requestId, auditorId, remarks);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function rejectKYC(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const requestId = req.params.requestId as string;
    const { remarks } = req.body;
    const auditorId = req.user!.userId;

    if (!remarks) {
      return res.status(400).json({ error: "Remarks required for rejection" });
    }

    const result = await kycService.rejectKYC(requestId, auditorId, remarks);
    res.json(result);
  } catch (error) {
    next(error);
  }
}