// Holds the current access token in a plain module-level variable (memory
// only, never localStorage — deliberate, per the plan's XSS-avoidance
// decision) and notifies subscribers when it changes. The bridge between
// the singleton api-client instance (lib/api.js, which needs to read the
// token on every request) and React state (AuthContext, which needs to
// react to it changing).
let accessToken = null;
const listeners = new Set();

// Read the current token — used by the http client on every outgoing request.
export function getAccessToken() {
  return accessToken;
}

// Sets the token (or null to clear it) and notifies every subscriber.
export function setAccessToken(token) {
  accessToken = token;
  for (const listener of listeners) listener(token);
}

// Registers a callback for token changes; returns an unsubscribe function.
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
