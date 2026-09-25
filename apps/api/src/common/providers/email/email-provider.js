/**
 * Contract every email provider implements (Phase 1: DevLogEmailProvider,
 * a later phase: Resend — the real provider this stack plans to swap in,
 * so this is a planned swap point, not speculative infra).
 *
 * @typedef {object} EmailProvider
 * @property {(email: string, resetLink: string) => Promise<void>} sendPasswordResetEmail
 */
export {};
