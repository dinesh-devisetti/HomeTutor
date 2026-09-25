// Thin fetch wrapper shared by every resource module below: adds the JSON
// content-type, the bearer access token (from memory, via getAccessToken),
// and credentials:'include' so the httpOnly refresh cookie travels
// cross-origin. Does not itself know how to refresh — that's injected via
// refreshAccessToken (defined in the web app's AuthContext using a raw
// fetch, so it can't recurse into this same 401-retry logic).
export function createHttpClient({ baseUrl, getAccessToken, refreshAccessToken }) {
  // Builds the URL (with query params) and fires one fetch call — no
  // retry/refresh logic here, that lives in request() below.
  async function rawRequest(method, path, { body, params } = {}) {
    const url = new URL(path, baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const headers = { "Content-Type": "application/json" };
    const token = getAccessToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  // Parses a fetch Response into JSON (or null for 204), throwing an Error
  // with .statusCode/.details attached on a non-2xx status so callers can
  // branch on the same shape the API's AppError produces.
  async function parseResponse(res) {
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const error = new Error(data?.error || `Request failed with status ${res.status}`);
      error.statusCode = res.status;
      error.details = data?.details;
      throw error;
    }
    return data;
  }

  // The real entrypoint every resource method calls: fires the request,
  // and on a single 401 tries refreshAccessToken() once and retries — so
  // an expired access token is invisible to the rest of the app instead of
  // surfacing as a failed request.
  async function request(method, path, options = {}) {
    let res = await rawRequest(method, path, options);

    if (res.status === 401 && refreshAccessToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        res = await rawRequest(method, path, options);
      }
    }

    return parseResponse(res);
  }

  return {
    get: (path, options) => request("GET", path, options),
    post: (path, options) => request("POST", path, options),
    patch: (path, options) => request("PATCH", path, options),
    delete: (path, options) => request("DELETE", path, options),
  };
}
