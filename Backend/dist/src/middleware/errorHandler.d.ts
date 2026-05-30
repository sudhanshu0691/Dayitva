import { Request, Response, NextFunction } from "express";
/**
 * Custom application error with HTTP status code
 */
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
/**
 * Not Found handler - for undefined routes
 */
export declare function notFoundHandler(req: Request, _res: Response, next: NextFunction): void;
/**
 * Global error handler middleware.
 * Catches all errors thrown in route handlers and middleware.
 * Returns consistent JSON error response.
 */
export declare function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map