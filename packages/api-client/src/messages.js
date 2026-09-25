// Wraps the messaging module — per-booking REST chat.
export function createMessagesApi(client) {
  return {
    // Sends a message on a booking's thread.
    send: (bookingId, input) => client.post(`/bookings/${bookingId}/messages`, { body: input }),
    // Reads a booking's thread — contact-detail masking is applied
    // server-side, the client just renders whatever body text comes back.
    list: (bookingId) => client.get(`/bookings/${bookingId}/messages`),
  };
}
