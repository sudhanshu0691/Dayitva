// ============================================================
// Global Error Handler Middleware
// Catches all unhandled errors and returns consistent JSON
// ============================================================

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";
import { IApiResponse } from "../types";

/**
 * Custom application error with HTTP status code
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Not Found handler - for undefined routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Global error handler middleware.
 * Catches all errors thrown in route handlers and middleware.
 * Returns consistent JSON error response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
    });
  } else {
    logger.error(`Unexpected error: ${err.message}`, {
      error: err.stack,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join(".");
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });

    const response: IApiResponse = {
      success: false,
      message: "Validation failed",
      errors,
    };

    res.status(400).json(response);
    return;
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    const response: IApiResponse = {
      success: false,
      message: err.message,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    const response: IApiResponse = {
      success: false,
      message: "Invalid or expired token",
    };
    res.status(401).json(response);
    return;
  }

  // Default - unknown error
  const response: IApiResponse = {
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  };

  res.status(500).json(response);
}