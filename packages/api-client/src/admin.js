// Wraps the platform-wide admin oversight endpoints (all ADMIN-only
// server-side) — distinct from verification.js, which is scoped
// specifically to tutor verification.
export function createAdminApi(client) {
  return {
    // Lists every user, optionally filtered by role.
    listUsers: (params) => client.get("/admin/users", { params }),
    // Lists every booking, optionally filtered by status.
    listBookings: (params) => client.get("/admin/bookings", { params }),
    // Lists every review platform-wide.
    listReviews: () => client.get("/admin/reviews"),
    // Deletes a review (moderation) — audit-logged server-side.
    deleteReview: (id) => client.delete(`/admin/reviews/${id}`),
  };
}
