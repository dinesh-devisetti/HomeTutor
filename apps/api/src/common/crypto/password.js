import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

// Hashes a plaintext password with scrypt + a random salt (no external
// dependency needed — Node's built-in KDF is sufficient for Phase 1). Used
// at signup and by the seed script, so seeded users can actually log in.
// Stored format is "scrypt:<saltHex>:<hashHex>" in User.passwordHash.
export function hashPassword(plainPassword) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

// Verifies a login attempt's plaintext password against the stored hash,
// using a constant-time comparison (timingSafeEqual) so response timing
// can't leak how much of the hash matched.
export function verifyPassword(plainPassword, storedHash) {
  const [algorithm, saltHex, hashHex] = storedHash.split(":");
  if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(plainPassword, salt, expected.length);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
