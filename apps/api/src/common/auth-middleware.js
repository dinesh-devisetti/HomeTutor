import jwt from "jsonwebtoken";
import { unauthorized } from "./errors.js";

// Authentication gate for protected routes: verifies the JWT access token
// from the Authorization header and attaches { id, role } to req.user for
// downstream authorization checks (requireRole, per-resource ownership
// checks in service layers). Rejects with 401 on missing/invalid/expired
// token — thrown, not passed to next(err); Express 5 forwards a rejected
// async middleware to the error-handling middleware on its own.
export function requireAuth({ secret }) {
  return async function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw unauthorized("Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      throw unauthorized("Invalid or expired token");
    }

    next();
  };
}
