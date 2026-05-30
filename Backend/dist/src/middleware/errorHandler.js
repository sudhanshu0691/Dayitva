"use strict";
// ============================================================
// Global Error Handler Middleware
// Catches all unhandled errors and returns consistent JSON
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
/**
 * Custom application error with HTTP status code
 */
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
/**
 * Not Found handler - for undefined routes
 */
function notFoundHandler(req, _res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
/**
 * Global error handler middleware.
 * Catches all errors thrown in route handlers and middleware.
 * Returns consistent JSON error response.
 */
function errorHandler(err, _req, res, _next) {
    // Log the error
    if (err instanceof AppError && err.isOperational) {
        logger_1.logger.warn(`Operational error: ${err.message}`, {
            statusCode: err.statusCode,
        });
    }
    else {
        logger_1.logger.error(`Unexpected error: ${err.message}`, {
            error: err.stack,
        });
    }
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        err.errors.forEach((e) => {
            const path = e.path.join(".");
            if (!errors[path])
                errors[path] = [];
            errors[path].push(e.message);
        });
        const response = {
            success: false,
            message: "Validation failed",
            errors,
        };
        res.status(400).json(response);
        return;
    }
    // Handle known operational errors
    if (err instanceof AppError) {
        const response = {
            success: false,
            message: err.message,
        };
        res.status(err.statusCode).json(response);
        return;
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        const response = {
            success: false,
            message: "Invalid or expired token",
        };
        res.status(401).json(response);
        return;
    }
    // Default - unknown error
    const response = {
        success: false,
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && { error: err.message }),
    };
    res.status(500).json(response);
}
//# sourceMappingURL=errorHandler.js.map