import { createHash, randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "../common/crypto/password.js";
import { badRequest, conflict, unauthorized } from "../common/errors.js";
import { hashRefreshToken } from "./token.service.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_REQUESTS_PER_WINDOW = 5;
const OTP_WINDOW_MS = 10 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

// Strips internal fields (passwordHash) from a User row before it ever
// reaches an HTTP response.
function toPublicUser(user) {
  return { id: user.id, email: user.email, phone: user.phone, role: user.role };
}

// Hashes an OTP code before storing it in the in-memory otpStore, so even a
// process-memory dump doesn't expose active codes in plaintext.
function hashOtpCode(code) {
  return createHash("sha256").update(code).digest("hex");
}

// Generates a 6-digit numeric OTP code.
function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Generates a random password-reset token (sent in the reset link).
function generateResetToken() {
  return randomBytes(32).toString("hex");
}

// Hashes a reset token before storing it in the in-memory resetTokenStore —
// same principle as OTP codes: even a process-memory dump doesn't expose
// an active token that can be replayed.
function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// Business logic for every auth flow: email/password signup+login, phone
// OTP request+verify, password reset, refresh-token rotation, and logout.
export function createAuthService({ repository, tokenService, otpProvider, emailProvider, webOrigin }) {
  // Phase 1 dev-only in-memory OTP store, single process. Swap for
  // Redis when the API goes multi-instance (Phase 3+ territory) —
  // this function boundary is the only thing that would need to change.
  const otpStore = new Map(); // phone -> { codeHash, expiresAt, requestTimestamps }

  // Same pattern as otpStore, for password-reset tokens.
  const resetTokenStore = new Map(); // tokenHash -> { userId, expiresAt }

  // Shared by every login-equivalent flow (signup/login/OTP-verify/refresh):
  // signs a fresh access+refresh token pair and persists the refresh
  // token's hash so it can later be validated/revoked.
  async function issueTokensFor(user) {
    const accessToken = tokenService.signAccessToken(user);
    const { token: refreshToken, tokenHash, expiresAt } = tokenService.issueRefreshToken(user);
    await repository.storeRefreshToken({ userId: user.id, tokenHash, expiresAt });
    return { accessToken, refreshToken, refreshExpiresAt: expiresAt };
  }

  // Email/password signup for PARENT or TUTOR (self-signup roles only —
  // STUDENT accounts are created by a guardian, ADMIN only via seed/ops).
  // Rejects a duplicate email with 409, then creates the User plus its
  // Parent/Tutor profile row and logs the new user in immediately.
  async function signup(input) {
    const existing = await repository.findUserByEmail(input.email);
    if (existing) throw conflict("Email already registered");

    const passwordHash = hashPassword(input.password);
    const create = input.role === "TUTOR" ? repository.createTutorUser : repository.createParentUser;
    const user = await create({ email: input.email, passwordHash, fullName: input.fullName });

    const tokens = await issueTokensFor(user);
    return { user: toPublicUser(user), ...tokens };
  }

  // Email/password login: verifies the password hash (constant-time) and
  // issues a fresh token pair. Deliberately returns the same generic error
  // for "no such user" and "wrong password" so login can't be used to
  // enumerate registered emails.
  async function login(input) {
    const user = await repository.findUserByEmail(input.email);
    if (!user || !user.passwordHash) throw unauthorized("Invalid email or password");
    if (!verifyPassword(input.password, user.passwordHash)) {
      throw unauthorized("Invalid email or password");
    }

    const tokens = await issueTokensFor(user);
    return { user: toPublicUser(user), ...tokens };
  }

  // Generates and "sends" (via OtpProvider — a dev-log stub in Phase 1) a
  // one-time code for phone login, throttled to OTP_MAX_REQUESTS_PER_WINDOW
  // per phone per OTP_WINDOW_MS to slow down abuse. Never returns the code
  // itself in the response — a caller only learns it via the OtpProvider
  // (the server log, in Phase 1).
  async function requestOtp({ phone }) {
    const now = Date.now();
    const existing = otpStore.get(phone);
    const recentRequests = (existing?.requestTimestamps ?? []).filter((t) => now - t < OTP_WINDOW_MS);

    if (recentRequests.length >= OTP_MAX_REQUESTS_PER_WINDOW) {
      throw badRequest("Too many OTP requests, try again later");
    }

    const code = generateOtpCode();
    otpStore.set(phone, {
      codeHash: hashOtpCode(code),
      expiresAt: now + OTP_TTL_MS,
      requestTimestamps: [...recentRequests, now],
    });

    await otpProvider.sendOtp(phone, code);
    return {};
  }

  // Verifies a submitted OTP code against the stored (hashed) one, one-time
  // use (deleted from the store immediately on match). On success, logs in
  // the existing user for that phone number, or silently creates a new
  // PARENT account if this is the first time this phone has verified.
  async function verifyOtp({ phone, code }) {
    const entry = otpStore.get(phone);
    if (!entry || entry.expiresAt < Date.now()) {
      throw unauthorized("OTP expired or not requested");
    }
    if (entry.codeHash !== hashOtpCode(code)) {
      throw unauthorized("Incorrect OTP code");
    }
    otpStore.delete(phone); // one-time use

    let user = await repository.findUserByPhone(phone);
    if (!user) {
      user = await repository.createOtpUser({ phone });
    }

    const tokens = await issueTokensFor(user);
    return { user: toPublicUser(user), ...tokens };
  }

  // Rotates a refresh token: verifies the JWT signature+expiry, then
  // double-checks the matching DB row is still active (not already
  // revoked/expired) and belongs to the same user the JWT claims — this is
  // what makes a stolen-then-reused-after-rotation refresh token fail even
  // if its JWT signature is still technically valid. On success, revokes
  // the presented token and issues a brand new pair (single-use rotation).
  async function refresh(rawRefreshToken) {
    if (!rawRefreshToken) throw unauthorized("Missing refresh token");

    let payload;
    try {
      payload = tokenService.verifyRefreshToken(rawRefreshToken);
    } catch {
      throw unauthorized("Invalid or expired refresh token");
    }

    const tokenHash = hashRefreshToken(rawRefreshToken);
    const row = await repository.findActiveRefreshTokenByHash(tokenHash);
    if (!row || row.userId !== payload.sub || row.expiresAt < new Date()) {
      throw unauthorized("Invalid or expired refresh token");
    }

    await repository.revokeRefreshToken(row.id);

    const user = await repository.findUserById(payload.sub);
    if (!user) throw unauthorized("User no longer exists");

    const tokens = await issueTokensFor(user);
    return { user: toPublicUser(user), ...tokens };
  }

  // Revokes the presented refresh token if it's still active; silently
  // no-ops on a missing/already-revoked token so logout is always "safe"
  // to call (idempotent) rather than erroring on a stale session.
  async function logout(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const row = await repository.findActiveRefreshTokenByHash(tokenHash);
    if (row) await repository.revokeRefreshToken(row.id);
  }

  // Starts the forgot-password flow: if the email is registered, generates
  // a one-time reset token and "emails" a reset link (dev-log stub in
  // Phase 1). Always returns the same {} response whether or not the email
  // exists — same anti-enumeration principle as login's generic error, so
  // this endpoint can't be used to discover which emails are registered.
  async function requestPasswordReset({ email }) {
    const user = await repository.findUserByEmail(email);
    if (user) {
      const token = generateResetToken();
      resetTokenStore.set(hashResetToken(token), { userId: user.id, expiresAt: Date.now() + PASSWORD_RESET_TTL_MS });
      const resetLink = `${webOrigin}/reset-password?token=${token}`;
      await emailProvider.sendPasswordResetEmail(email, resetLink);
    }
    return {};
  }

  // Completes the forgot-password flow: validates the token (one-time use,
  // deleted on match), sets the new password hash, and revokes every
  // active refresh token for that user — so a session hijacked before the
  // reset doesn't survive a password change.
  async function resetPassword({ token, newPassword }) {
    const tokenHash = hashResetToken(token);
    const entry = resetTokenStore.get(tokenHash);
    if (!entry || entry.expiresAt < Date.now()) {
      throw badRequest("Invalid or expired reset token");
    }
    resetTokenStore.delete(tokenHash);

    const passwordHash = hashPassword(newPassword);
    await repository.updateUser(entry.userId, { passwordHash });
    await repository.revokeAllRefreshTokensForUser(entry.userId);

    return {};
  }

  return {
    signup,
    login,
    requestOtp,
    verifyOtp,
    refresh,
    logout,
    requestPasswordReset,
    resetPassword,
    toPublicUser,
  };
}
