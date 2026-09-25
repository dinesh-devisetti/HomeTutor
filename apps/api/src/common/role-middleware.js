import { forbidden } from "./errors.js";

// Coarse RBAC gate: only lets the request through if req.user's role is one
// of the allowed roles (e.g. requireRole("ADMIN")). Must run after
// requireAuth. Doesn't know about ownership of a specific resource — that's
// checked separately inside each service where "is this MY booking/tutor" matters.
export function requireRole(...roles) {
  return async function roleMiddleware(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      throw forbidden("Insufficient role");
    }
    next();
  };
}
