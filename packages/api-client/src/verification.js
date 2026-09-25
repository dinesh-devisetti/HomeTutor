// Wraps the admin verification module — every method here is ADMIN-only
// server-side, this file just mirrors the routes.
export function createVerificationApi(client) {
  return {
    // Lists tutors awaiting review.
    queue: () => client.get("/admin/verification/queue"),
    // Approves a tutor, making them eligible for public search.
    approve: (tutorId) => client.post(`/admin/verification/${tutorId}/approve`),
    // Rejects a tutor with a required reason.
    reject: (tutorId, reason) => client.post(`/admin/verification/${tutorId}/reject`, { body: { reason } }),
    // Reads one verification document (audit-logged server-side).
    readDocument: (tutorId, docId) => client.get(`/admin/verification/${tutorId}/documents/${docId}`),
    // Lists recent audit-log entries, optionally filtered by targetType.
    auditLog: (params) => client.get("/admin/audit-log", { params }),
  };
}
