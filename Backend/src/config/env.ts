// ============================================================
// Environment Configuration Loader
// Loads and validates environment variables with defaults
// ============================================================

import dotenv from "dotenv";
import path from "path";

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "dev-jwt-secret-change-in-production",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-jwt-refresh-secret-change-in-production",
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",

  // Pinata (IPFS)
  PINATA_API_KEY: process.env.PINATA_API_KEY || "",
  PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY || "",

  // AWS S3
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "ap-south-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "tenderchain-documents",

  // ===========================================
  // Local Ganache Blockchain
  // ===========================================
  ETH_RPC_URL: process.env.ETH_RPC_URL || "http://127.0.0.1:7545",
  ETH_CHAIN_ID: parseInt(process.env.ETH_CHAIN_ID || "1337", 10),
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",
  OFFICER_PRIVATE_KEY: process.env.OFFICER_PRIVATE_KEY || "",
  VENDOR_PRIVATE_KEY: process.env.VENDOR_PRIVATE_KEY || "",
  BLOCKCHAIN_SIMULATION_MODE: process.env.BLOCKCHAIN_SIMULATION_MODE === "true",

  // Socket.io
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "debug",
} as const;

export function validateEnv(): void {
  const requiredVars = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      console.error("   Copy .env.example to .env and fill in the values");
      process.exit(1);
    }
  }
}