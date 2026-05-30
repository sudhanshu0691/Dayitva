// ============================================================
// Winston Logger Configuration
// Provides structured logging with different transports
// ============================================================

import winston from "winston";
import { env } from "../config/env";

// Define log formats
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? ` | ${JSON.stringify(meta, null, 0)}`
      : "";
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

/**
 * Application-wide logger instance.
 * 
 * Log levels: error, warn, info, http, verbose, debug, silly
 * 
 * Usage:
 *   logger.info("Server started", { port: 4000 });
 *   logger.error("Database connection failed", { error: err.message });
 */
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Error log file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: fileFormat,
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: "logs/combined.log",
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});