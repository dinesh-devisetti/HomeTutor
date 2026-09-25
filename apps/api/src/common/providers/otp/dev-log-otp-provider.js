/** @implements {import('./otp-provider.js').OtpProvider} */
export class DevLogOtpProvider {
  // Phase 1 stub SMS provider — instead of calling Twilio/MSG91, just logs
  // the OTP code to the server console so local dev/testing doesn't need a
  // real SMS account. Swap point for a real provider in a later phase.
  async sendOtp(phone, code) {
    console.log(`[dev-otp] phone=${phone} code=${code}`);
  }
}
