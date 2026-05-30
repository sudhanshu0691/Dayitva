"use strict";
// ============================================================
// Winston Logger Configuration
// Provides structured logging with different transports
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
// Define log formats
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
        ? ` | ${JSON.stringify(meta, null, 0)}`
        : "";
    return `${timestamp} [${level}]: ${message}${metaStr}`;
}));
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json());
/**
 * Application-wide logger instance.
 *
 * Log levels: error, warn, info, http, verbose, debug, silly
 *
 * Usage:
 *   logger.info("Server started", { port: 4000 });
 *   logger.error("Database connection failed", { error: err.message });
 */
exports.logger = winston_1.default.createLogger({
    level: env_1.env.LOG_LEVEL,
    transports: [
        // Console transport (always enabled)
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
        // Error log file
        new winston_1.default.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
        // Combined log file
        new winston_1.default.transports.File({
            filename: "logs/combined.log",
            format: fileFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }),
    ],
});
//# sourceMappingURL=logger.js.map