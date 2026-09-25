// Wraps the auth module's REST endpoints. All five login-equivalent calls
// (signup/login/verifyOtp/refresh) return { user, accessToken,
// refreshExpiresAt } — the refresh token itself never appears here, it
// travels as an httpOnly cookie the browser handles automatically.
export function createAuthApi(client) {
  return {
    // Email/password account creation.
    signup: (input) => client.post("/auth/signup", { body: input }),
    // Email/password login.
    login: (input) => client.post("/auth/login", { body: input }),
    // Starts phone-OTP login — no code in the response, check the OtpProvider.
    requestOtp: (input) => client.post("/auth/otp/request", { body: input }),
    // Completes phone-OTP login.
    verifyOtp: (input) => client.post("/auth/otp/verify", { body: input }),
    // Silent refresh — reads the refresh cookie server-side, no body needed.
    refresh: () => client.post("/auth/refresh"),
    // Ends the session server-side and clears the refresh cookie.
    logout: () => client.post("/auth/logout"),
    // Starts the forgot-password flow — same response whether or not the
    // email is registered.
    forgotPassword: (input) => client.post("/auth/password/forgot", { body: input }),
    // Completes the forgot-password flow with a valid reset token.
    resetPassword: (input) => client.post("/auth/password/reset", { body: input }),
  };
}
