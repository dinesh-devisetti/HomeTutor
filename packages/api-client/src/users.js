// Wraps the "own profile" endpoints.
export function createUsersApi(client) {
  return {
    // Fetches the logged-in caller's own profile.
    me: () => client.get("/users/me"),
    // Updates the logged-in caller's display name.
    updateMe: (input) => client.patch("/users/me", { body: input }),
  };
}
