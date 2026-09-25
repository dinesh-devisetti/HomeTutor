// Wraps the bookings module's full lifecycle — one method per
// BookingStateMachine event, mirroring the API's route names exactly so
// it's easy to trace a UI action back to its endpoint.
export function createBookingsApi(client) {
  return {
    // Parent requests a new booking with a tutor for their own student.
    create: (input) => client.post("/bookings", { body: input }),
    // Lists the caller's own bookings (role-aware on the server).
    mine: () => client.get("/bookings/mine"),
    // Reads one booking by id.
    get: (id) => client.get(`/bookings/${id}`),
    // Tutor accepts a REQUESTED booking.
    accept: (id) => client.post(`/bookings/${id}/accept`),
    // Tutor declines a REQUESTED booking, with an optional reason.
    decline: (id, reason) => client.post(`/bookings/${id}/decline`, { body: { reason } }),
    // Parent (or admin) confirms an ACCEPTED booking (mock payment).
    confirm: (id) => client.post(`/bookings/${id}/confirm`),
    // Tutor marks a CONFIRMED session as started.
    start: (id) => client.post(`/bookings/${id}/start`),
    // Cancels a booking, with an optional reason (who's allowed depends on
    // current status — enforced server-side).
    cancel: (id, reason) => client.post(`/bookings/${id}/cancel`, { body: { reason } }),
    // Tutor marks an IN_PROGRESS session as finished.
    complete: (id) => client.post(`/bookings/${id}/complete`),
    // Tutor or admin marks a session as a no-show.
    noShow: (id) => client.post(`/bookings/${id}/no-show`),
    // Admin-only: marks a CONFIRMED booking refunded.
    refund: (id) => client.post(`/bookings/${id}/refund`),
  };
}
