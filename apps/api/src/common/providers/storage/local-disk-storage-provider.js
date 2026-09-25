import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/** @implements {import('./storage-provider.js').StorageProvider} */
export class LocalDiskStorageProvider {
  // Phase 1 stub storage backend — writes under a configured local
  // directory instead of a real object store (Cloudflare R2 arrives later).
  constructor({ baseDir }) {
    this.baseDir = baseDir;
  }

  // Writes a file's bytes to baseDir/key, creating any intermediate
  // directories. Used for tutor verification-doc uploads (base64-decoded
  // in tutors.service.js before reaching here).
  async upload(key, buffer, _mimeType) {
    const fullPath = path.join(this.baseDir, key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
    return { key };
  }

  // Resolves a storage key to a URL the caller can fetch the file from.
  async getReadUrl(key) {
    // Served by an admin-only route added alongside the verification module
    // (build step 8) — never a public static mount, since these are PII docs.
    return `/admin/verification/documents/${encodeURIComponent(key)}`;
  }

  // Removes a stored file; swallows "already gone" errors since callers
  // treat delete as idempotent cleanup, not a strict existence check.
  async delete(key) {
    const fullPath = path.join(this.baseDir, key);
    await unlink(fullPath).catch(() => {});
  }
}
