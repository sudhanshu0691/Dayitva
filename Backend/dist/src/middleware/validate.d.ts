import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
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
export declare function validate(schema: ZodSchema, source?: "body" | "query" | "params"): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map