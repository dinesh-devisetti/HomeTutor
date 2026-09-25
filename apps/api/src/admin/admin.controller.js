// Admin controllers: no path/middleware knowledge here, that lives in
// admin.routes.js.
export function createAdminController({ adminService }) {
  return {
    // Platform-wide user roster, optionally filtered by ?role=.
    async listUsers(req, res) {
      res.status(200).json(await adminService.listUsers(req.query));
    },

    // Platform-wide booking list, optionally filtered by ?status= — an
    // admin finds a booking here, then acts on it via the existing
    // GET/POST /bookings/:id endpoints (already ADMIN-aware regardless of
    // ownership, no new action routes needed).
    async listBookings(req, res) {
      res.status(200).json(await adminService.listBookings(req.query));
    },

    // Platform-wide review list, for moderation.
    async listReviews(req, res) {
      res.status(200).json(await adminService.listReviews());
    },

    // Moderation: hard-deletes a review (audit-logged).
    async deleteReview(req, res) {
      res.status(200).json(await adminService.deleteReview(req.user.id, req.params.id));
    },
  };
}
