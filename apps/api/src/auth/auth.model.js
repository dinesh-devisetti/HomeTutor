// All Prisma/SQL access for the auth module — signup, login, refresh-token
// storage, and the User<->Parent/Tutor creation that happens at signup time.
export function createAuthModel(prisma) {
  return {
    // Looks up a user for email/password login (or checking email-already-
    // registered on signup).
    findUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),
    // Looks up a user for OTP verify — an existing phone number means
    // "log this person in", a new one means "create an account for them".
    findUserByPhone: (phone) => prisma.user.findUnique({ where: { phone } }),
    // Looks up a user by id — used when resolving the subject of a valid
    // refresh token back into a full user record.
    findUserById: (id) => prisma.user.findUnique({ where: { id } }),

    // Creates a User + its Parent profile in one write, for email/password
    // signup with role=PARENT.
    createParentUser: ({ email, passwordHash, fullName }) =>
      prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "PARENT",
          parent: { create: { fullName } },
        },
      }),

    // Creates a User + its Tutor profile (starts UNVERIFIED by the
    // Tutor model's default) for email/password signup with role=TUTOR.
    createTutorUser: ({ email, passwordHash, fullName }) =>
      prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "TUTOR",
          tutor: { create: { fullName } },
        },
      }),

    // OTP-only signup: role defaults to PARENT (a Student can be added
    // under this Parent afterwards); no password until the user sets one.
    createOtpUser: ({ phone }) =>
      prisma.user.create({
        data: {
          phone,
          role: "PARENT",
          parent: { create: { fullName: "" } },
        },
      }),

    // Persists a newly-issued refresh token's hash+expiry after login/
    // signup/refresh, so it can later be validated and revoked.
    storeRefreshToken: ({ userId, tokenHash, expiresAt }) =>
      prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } }),

    // Finds a not-yet-revoked refresh token row by its hash — the check
    // that makes refresh-token rotation actually enforce single-use
    // (a token whose row is already revoked fails this lookup).
    findActiveRefreshTokenByHash: (tokenHash) =>
      prisma.refreshToken.findFirst({ where: { tokenHash, revokedAt: null } }),

    // Marks a refresh token as used/revoked — called on every successful
    // refresh (rotation) and on logout.
    revokeRefreshToken: (id) =>
      prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } }),

    // Generic user field update — used by password reset to write the new
    // passwordHash.
    updateUser: (id, data) => prisma.user.update({ where: { id }, data }),

    // Revokes every active refresh token for a user — called on password
    // reset so a stolen-but-not-yet-rotated session doesn't survive a
    // password change (forces re-login everywhere).
    revokeAllRefreshTokensForUser: (userId) =>
      prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  };
}
