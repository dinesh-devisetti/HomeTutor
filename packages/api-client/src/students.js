// Wraps the students module — parent-only creation, guardian-scoped reads.
export function createStudentsApi(client) {
  return {
    // Adds a child under the logged-in parent's own account.
    create: (input) => client.post("/students", { body: input }),
    // Reads one student by id (server enforces guardian ownership).
    get: (id) => client.get(`/students/${id}`),
    // Lists the logged-in parent's own children.
    mine: () => client.get("/students/mine"),
  };
}
