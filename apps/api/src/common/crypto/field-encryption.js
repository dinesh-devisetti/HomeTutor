import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts/decrypts PII fields (address, phone, ID doc metadata) at rest.
 * Ciphertext layout stored in the DB Bytes column: iv || authTag || data.
 */
export class FieldEncryptionService {
  #key;

  // Loads the 32-byte encryption key from config (hex-encoded env var) and
  // fails fast at startup if it's the wrong length, rather than failing
  // later on the first encrypt/decrypt call.
  constructor(hexKey) {
    this.#key = Buffer.from(hexKey, "hex");
    if (this.#key.length !== 32) {
      throw new Error("FIELD_ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
    }
  }

  // Encrypts a plaintext PII value (e.g. address, phone) with a fresh random
  // IV per call, returning iv||authTag||ciphertext ready to store directly
  // in a Prisma Bytes column.
  encrypt(plainText) {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.#key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, encrypted]);
  }

  // Reverses encrypt(): splits the stored buffer back into iv/authTag/data
  // and decrypts, verifying the auth tag (throws if the ciphertext was
  // tampered with or the key is wrong).
  decrypt(buffer) {
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, this.#key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  }
}
