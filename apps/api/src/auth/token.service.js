import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";

const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Hashes a raw refresh token (SHA-256) for DB storage — the DB never holds
// the actual bearer token, only something that can verify a presented one
// matches, so a DB leak alone can't be used to mint sessions.
export function hashRefreshToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// Builds the token issuance/verification functions used by auth.service.js.
// Kept separate from auth.service so JWT mechanics (signing, TTLs, hashing)
// are isolated from the business logic of signup/login/refresh/logout.
export function createTokenService({ jwtSecret, jwtRefreshSecret }) {
  // Short-lived (15m) access token carrying { sub: userId, role }, checked
  // by requireAuth on every protected request. Never stored server-side.
  function signAccessToken(user) {
    return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: ACCESS_TOKEN_TTL });
  }

  // Long-lived (30d) refresh token, signed separately from the access
  // token (different secret) so a leaked access token can't be replayed as
  // a refresh token. Returns the raw token (sent to the client as a cookie)
  // plus its hash+expiry (stored in the RefreshToken table) so
  // auth.service.js can persist and later revoke it.
  function issueRefreshToken(user) {
    const jti = randomUUID();
    const token = jwt.sign({ sub: user.id, jti }, jwtRefreshSecret, {
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });
    return {
      token,
      tokenHash: hashRefreshToken(token),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    };
  }

  // Verifies a refresh token's signature and expiry. Only proves the token
  // was issued by us and isn't expired — auth.service.js separately checks
  // the DB row exists and hasn't already been revoked (rotation).
  function verifyRefreshToken(token) {
    return jwt.verify(token, jwtRefreshSecret);
  }

  return { signAccessToken, issueRefreshToken, verifyRefreshToken };
}
