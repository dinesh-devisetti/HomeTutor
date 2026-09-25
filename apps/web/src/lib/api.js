import { createApiClient, createHttpClient } from "@hometutoring/api-client";
import { getAccessToken, setAccessToken } from "./token-store.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Dedupes concurrent refreshAccessToken() calls into a single in-flight
// request. Without this, two callers racing at once (React StrictMode's
// double-mount of AuthContext's bootstrap effect in dev; or two http-client
// requests both hitting a 401 at the same time) each send the *same*
// httpOnly refresh cookie before either response has rotated it — the
// refresh token is single-use, so the second request to reach the server
// gets a 401 even though the first one succeeded, and the app can end up
// looking logged-out right after a real login. Sharing one promise means
// every concurrent caller waits on the one request that actually happens.
let inFlightRefresh = null;

// Silent-refresh implementation, called by the http client on a 401 (and
// once on app mount by AuthContext). Deliberately a raw fetch, not routed
// through the wrapped client — going through it would recurse into this
// same 401-retry logic.
export async function refreshAccessToken() {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    try {
      const res = await fetch(new URL("/auth/refresh", API_BASE_URL), {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setAccessToken(null);
        return false;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      return true;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

const httpClient = createHttpClient({
  baseUrl: API_BASE_URL,
  getAccessToken,
  refreshAccessToken,
});

// Single shared API client instance for the whole app — every page/hook
// imports this rather than constructing its own.
export const api = createApiClient(httpClient);
