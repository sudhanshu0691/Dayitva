"use strict";
// ============================================================
// Zod Validation Middleware
// Validates request body/query/params against Zod schemas
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
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
function validate(schema, source = "body") {
    return (req, _res, next) => {
        try {
            const data = schema.parse(req[source]);
            // Replace with validated (and potentially transformed) data
            req[source] = data;
            next();
        }
        catch (error) {
            next(error); // Will be caught by errorHandler
        }
    };
}
//# sourceMappingURL=validate.js.map