// Domain/HTTP error type: any code that throws an AppError gets it turned
// into the matching HTTP status + JSON error body by app.js's Express
// error-handling middleware, instead of a generic 500 — the single place
// status codes are decided.
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

// 400 — request failed validation or otherwise makes no sense (invalid
// payload, invalid state-machine transition, etc).
export const badRequest = (message = "Bad request", details) => new AppError(400, message, details);
// 401 — missing/invalid/expired credentials (no bearer token, bad refresh
// token, wrong password).
export const unauthorized = (message = "Unauthorized") => new AppError(401, message);
// 403 — caller is authenticated but not allowed to do this specific thing
// (wrong role, or right role but not the owner of the resource).
export const forbidden = (message = "Forbidden") => new AppError(403, message);
// 404 — resource doesn't exist (or, for cross-tenant lookups, exists but
// isn't visible to this caller — same status either way to avoid leaking).
export const notFound = (message = "Not found") => new AppError(404, message);
// 409 — request conflicts with current state (duplicate email on signup,
// double-booking exclusion-constraint violation, concurrent status change).
export const conflict = (message = "Conflict") => new AppError(409, message);
