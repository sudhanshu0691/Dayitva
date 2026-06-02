// ============================================================
// Blockchain Routes
// Handles MetaMask transaction storage and contract info
// ============================================================

import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleGuard";
import * as blockchainController from "../controllers/blockchain.controller";

const router = Router();

// Protected routes
router.post("/transaction", authenticate, blockchainController.storeTransaction);
router.get("/transactions/mine", authenticate, blockchainController.getMyTransactions);
router.get("/transactions/tender/:tenderId", authenticate, blockchainController.getTenderTransactions);
router.get("/verify/:txHash", authenticate, blockchainController.verifyTransaction);

// Public contract info
router.get("/contract-info", blockchainController.getContractInfo);

export default router;