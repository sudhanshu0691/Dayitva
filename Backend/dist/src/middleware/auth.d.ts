import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
/**
 * Authentication middleware.
 * Extracts and verifies JWT Bearer token from Authorization header.
 * Attaches decoded user payload to request.user.
 */
export declare function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void;
/**
 * Optional authentication middleware.
 * Attaches user info if token is present, but doesn't fail if missing.
 */
export declare function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map