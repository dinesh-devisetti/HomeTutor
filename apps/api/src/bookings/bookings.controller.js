// Booking controllers: each function receives (req, res) already past
// whatever auth/role/validation middleware bookings.routes.js attached to
// its route — no path or middleware knowledge lives here, just "call the
// service, shape the response." Kept separate from routes.js so these are
// callable/testable directly (a fake req/res, no Express involved) and so
// routes.js can stay a pure table of contents for this module's URL surface.
export function createBookingsController({ bookingsService }) {
  return {
    // Parent requests a new booking with a tutor for their own student.
    async create(req, res) {
      const booking = await bookingsService.create(req.user.id, req.body);
      res.status(201).json(booking);
    },

    // Lists the caller's own bookings (as parent or tutor, role-aware).
    async listMine(req, res) {
      res.status(200).json(await bookingsService.listMine(req.user.id, req.user.role));
    },

    // Reads one booking by id, restricted to its own parent/tutor or an admin.
    async getById(req, res) {
      res.status(200).json(await bookingsService.getById(req.user.id, req.user.role, req.params.id));
    },

    // Tutor accepts a REQUESTED booking (REQUESTED -> ACCEPTED).
    async accept(req, res) {
      res.status(200).json(await bookingsService.accept(req.user.id, req.user.role, req.params.id));
    },

    // Tutor declines a REQUESTED booking, with an optional reason
    // (REQUESTED -> DECLINED).
    async decline(req, res) {
      res
        .status(200)
        .json(await bookingsService.decline(req.user.id, req.user.role, req.params.id, req.body.reason));
    },

    // Parent (or admin) confirms an ACCEPTED booking — triggers the mock
    // payment provider before moving to CONFIRMED (ACCEPTED -> CONFIRMED).
    async confirm(req, res) {
      res.status(200).json(await bookingsService.confirm(req.user.id, req.user.role, req.params.id));
    },

    // Tutor marks a CONFIRMED session as started (CONFIRMED -> IN_PROGRESS).
    async start(req, res) {
      res.status(200).json(await bookingsService.start(req.user.id, req.user.role, req.params.id));
    },

    // Cancels a booking, with an optional reason — who's allowed depends on
    // the current status (parent only pre-payment; tutor/admin through
    // CONFIRMED); enforced in bookings.service.js's EVENT_RULES.CANCEL.
    async cancel(req, res) {
      res
        .status(200)
        .json(await bookingsService.cancel(req.user.id, req.user.role, req.params.id, req.body.reason));
    },

    // Tutor marks an IN_PROGRESS session as finished (IN_PROGRESS -> COMPLETED).
    async complete(req, res) {
      res.status(200).json(await bookingsService.complete(req.user.id, req.user.role, req.params.id));
    },

    // Tutor or admin marks a session as a no-show (CONFIRMED/IN_PROGRESS -> NO_SHOW).
    async noShow(req, res) {
      res.status(200).json(await bookingsService.noShow(req.user.id, req.user.role, req.params.id));
    },

    // Admin-only: marks a CONFIRMED booking refunded — status-only marker in
    // Phase 1, no real money moves until Razorpay lands in Phase 6.
    async refund(req, res) {
      res.status(200).json(await bookingsService.refund(req.user.id, req.user.role, req.params.id));
    },
  };
}
