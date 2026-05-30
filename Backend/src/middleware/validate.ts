// ============================================================
// Zod Validation Middleware
// Validates request body/query/params against Zod schemas
// ============================================================

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AuthRequest } from "../types";

/**
 * Validation middleware factory.
 * Validates request data against a Zod schema.
 * 
 * @param schema - Zod schema to validate against
 * @param source - Request property to validate ("body" | "query" | "params")
 * @returns Express middleware
 * 
 * Usage:
 *   router.post("/tenders", validate(createTenderSchema), createTender);
 *   router.get("/tenders", validate(tenderQuerySchema, "query"), listTenders);
 */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace with validated (and potentially transformed) data
      req[source] = data;
      next();
    } catch (error) {
      next(error); // Will be caught by errorHandler
    }
  };
}