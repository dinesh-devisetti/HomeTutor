import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, refreshAccessToken } from "../lib/api.js";
import { setAccessToken, subscribe } from "../lib/token-store.js";

const AuthContext = createContext(null);

// Provides the logged-in user (or null) and auth actions to the whole
// app. On mount, silently tries to refresh using the httpOnly cookie —
// this is what lets a page reload survive without forcing a re-login as
// long as the refresh token is still valid, since the access token itself
// only ever lives in memory (see token-store.js) and doesn't survive one.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Runs once on mount: attempt silent refresh, then load the profile if
  // it succeeded.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshed = await refreshAccessToken();
      if (refreshed && !cancelled) {
        try {
          const me = await api.users.me();
          if (!cancelled) setUser(me);
        } catch {
          if (!cancelled) setUser(null);
        }
      }
      if (!cancelled) setLoading(false);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keeps `user` in sync if the token gets cleared from elsewhere (e.g. the
  // http client's own failed-refresh path after a 401 it couldn't recover from).
  useEffect(() => {
    return subscribe((token) => {
      if (!token) setUser(null);
    });
  }, []);

  // Email/password login.
  const login = useCallback(async (input) => {
    const data = await api.auth.login(input);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // Email/password signup.
  const signup = useCallback(async (input) => {
    const data = await api.auth.signup(input);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // Completes phone-OTP login.
  const verifyOtp = useCallback(async (input) => {
    const data = await api.auth.verifyOtp(input);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  // Ends the session both server-side (revokes the refresh token) and
  // client-side (clears the in-memory access token and user state).
  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for reading auth state/actions from any component.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
