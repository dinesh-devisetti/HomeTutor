/**
 * Contract every storage provider implements (Phase 1: LocalDiskStorageProvider,
 * Phase 5+: a Cloudflare R2 / S3-compatible provider — swap only happens here).
 *
 * @typedef {object} StorageProvider
 * @property {(key: string, buffer: Buffer, mimeType: string) => Promise<{key: string}>} upload
 * @property {(key: string) => Promise<string>} getReadUrl
 * @property {(key: string) => Promise<void>} delete
 */
export {};
