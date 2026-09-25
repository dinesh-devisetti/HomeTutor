// Messaging controllers: no path/middleware knowledge here, that lives in
// messaging.routes.js.
export function createMessagingController({ messagingService }) {
  return {
    // Sends a message on a booking's thread — restricted to that
    // booking's own parent/tutor (or an admin), enforced inside
    // messagingService.
    async send(req, res) {
      const message = await messagingService.send(req.params.bookingId, req.user.id, req.user.role, req.body);
      res.status(201).json(message);
    },

    // Reads a booking's message thread — contact-detail masking is
    // applied server-side based on booking status, so the client just
    // renders whatever body text comes back (never trusts itself to mask).
    async list(req, res) {
      const messages = await messagingService.list(req.params.bookingId, req.user.id, req.user.role);
      res.status(200).json(messages);
    },
  };
}
