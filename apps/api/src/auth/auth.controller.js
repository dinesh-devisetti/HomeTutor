import { REFRESH_TOKEN_TTL_SECONDS } from "./token.service.js";

const REFRESH_COOKIE_NAME = "refresh_token";
const REFRESH_COOKIE_PATH = "/auth";

// Auth controllers: each function receives (req, res) already past
// whatever validation middleware auth.routes.js attached — no path
// knowledge here, just "call the service, manage the refresh cookie,
// shape the response."
export function createAuthController({ authService, config }) {
  // Cookie only carries Secure in prod-like origins (https) — plain HTTP
  // dev origins can't set Secure cookies and still have them accepted by
  // the browser.
  const secureCookies = config.WEB_ORIGIN.startsWith("https");

  // Sets the refresh token as an httpOnly, SameSite=Lax cookie scoped to
  // /auth — never exposed to client-side JS, and only sent back on auth
  // endpoints (not leaked to every API call). res.cookie's maxAge is
  // milliseconds; REFRESH_TOKEN_TTL_SECONDS is seconds, hence the *1000.
  function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: REFRESH_COOKIE_PATH,
      httpOnly: true,
      sameSite: "Lax",
      secure: secureCookies,
    });
  }

  // Clears the refresh cookie client-side, used on logout.
  function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      path: REFRESH_COOKIE_PATH,
      httpOnly: true,
      sameSite: "Lax",
      secure: secureCookies,
    });
  }

  return {
    // Email/password account creation for PARENT or TUTOR. Logs the new
    // user in immediately: access token in the JSON body, refresh token
    // as a cookie.
    async signup(req, res) {
      const { refreshToken, ...rest } = await authService.signup(req.body);
      setRefreshCookie(res, refreshToken);
      res.status(201).json(rest);
    },

    // Email/password login for an existing user.
    async login(req, res) {
      const { refreshToken, ...rest } = await authService.login(req.body);
      setRefreshCookie(res, refreshToken);
      res.status(200).json(rest);
    },

    // Starts phone-OTP login: generates and "sends" a one-time code
    // (dev-log stub in Phase 1). Response never reveals whether the phone
    // is already registered, and never contains the code itself.
    async requestOtp(req, res) {
      await authService.requestOtp(req.body);
      res.status(200).json({ sent: true });
    },

    // Completes phone-OTP login: verifies the code, logs in (or silently
    // creates) the user for that phone number, and issues tokens.
    async verifyOtp(req, res) {
      const { refreshToken, ...rest } = await authService.verifyOtp(req.body);
      setRefreshCookie(res, refreshToken);
      res.status(200).json(rest);
    },

    // Silent token refresh: reads the refresh token from its httpOnly
    // cookie (never sent in the body — the whole point of the cookie),
    // rotates it, and returns a fresh access token. Called by the SPA on
    // page load and whenever the access token is close to expiring.
    async refresh(req, res) {
      const { refreshToken, ...rest } = await authService.refresh(req.cookies[REFRESH_COOKIE_NAME]);
      setRefreshCookie(res, refreshToken);
      res.status(200).json(rest);
    },

    // Ends the session: revokes the refresh token server-side and clears
    // the cookie client-side, so neither half of the session survives.
    async logout(req, res) {
      await authService.logout(req.cookies[REFRESH_COOKIE_NAME]);
      clearRefreshCookie(res);
      res.status(204).end();
    },

    // Starts the forgot-password flow — "sends" a reset link (dev-log
    // stub in Phase 1) if the email is registered. Always the same
    // response either way, so this can't be used to enumerate registered
    // emails.
    async requestPasswordReset(req, res) {
      await authService.requestPasswordReset(req.body);
      res.status(200).json({ sent: true });
    },

    // Completes the forgot-password flow: sets a new password from a
    // valid, unexpired, one-time reset token and revokes every existing
    // session for that user.
    async resetPassword(req, res) {
      await authService.resetPassword(req.body);
      res.status(200).json({ reset: true });
    },
  };
}
