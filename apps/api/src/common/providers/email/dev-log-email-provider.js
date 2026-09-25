/** @implements {import('./email-provider.js').EmailProvider} */
export class DevLogEmailProvider {
  // Phase 1 stub email provider — instead of calling Resend, just logs the
  // reset link to the server console so local dev/testing doesn't need a
  // real email account. Swap point for a real provider in a later phase.
  async sendPasswordResetEmail(email, resetLink) {
    console.log(`[dev-email] password reset for ${email}: ${resetLink}`);
  }
}
