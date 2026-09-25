import { badRequest } from "./errors.js";

// Validates and coerces req.body against a Zod schema from packages/types
// before the route handler runs — this is the system-boundary validation.
// Replaces req.body with the parsed (typed/coerced) data on success.
export function validateBody(schema) {
  return function validateBodyMiddleware(req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw badRequest("Validation failed", result.error.flatten());
    }
    req.body = result.data;
    next();
  };
}

// Same as validateBody but for query-string params (e.g. search filters,
// audit-log filters) — query values arrive as strings, so schemas here
// typically use z.coerce for numbers/booleans. req.query is a read-only
// getter in Express 5 (a plain assignment silently doesn't stick), so the
// coerced result is installed via defineProperty instead — every
// controller still just reads req.query afterward, same as every other
// property on the request.
export function validateQuery(schema) {
  return function validateQueryMiddleware(req, res, next) {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      throw badRequest("Validation failed", result.error.flatten());
    }
    Object.defineProperty(req, "query", {
      value: result.data,
      configurable: true,
      writable: true,
      enumerable: true,
    });
    next();
  };
}
