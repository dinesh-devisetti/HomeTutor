import { forbidden, notFound } from "../common/errors.js";

// Statuses a booking only reaches after passing through CONFIRMED (mock
// payment) at least once — anti-disintermediation masking lifts here and
// stays lifted, since the platform's commission was already earned on this
// booking. REQUESTED/ACCEPTED/DECLINED/CANCELLED never had a confirmed
// payment, so masking stays on for those.
const UNMASKED_STATUSES = ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "NO_SHOW", "REFUNDED"];

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+?\d[\d\-\s]{6,}\d)/g;

// Redacts anything that looks like an email address or phone number from a
// message body — the actual anti-disintermediation mechanism. Applied on
// read, not on write, so the original text is never lost once the booking
// does reach CONFIRMED.
function maskContactDetails(body) {
  return body.replace(EMAIL_PATTERN, "[hidden]").replace(PHONE_PATTERN, "[hidden]");
}

export function createMessagingService({ repository }) {
  // Loads a booking and verifies the caller is one of its two participants
  // (or an admin) — the shared access check for both send() and list().
  async function assertParticipant(bookingId, userId, role) {
    const booking = await repository.findBookingForAccess(bookingId);
    if (!booking) throw notFound("Booking not found");

    const isParent = role === "PARENT" && booking.parent.userId === userId;
    const isTutor = role === "TUTOR" && booking.tutor.userId === userId;
    const isAdmin = role === "ADMIN";
    if (!isParent && !isTutor && !isAdmin) {
      throw forbidden("Not a participant in this booking");
    }

    return booking;
  }

  // Sends a message on a booking's thread. Allowed at any booking status —
  // parents and tutors can negotiate before a booking is even accepted;
  // it's the message *content* that gets masked pre-CONFIRMED, not the
  // ability to message at all.
  async function send(bookingId, userId, role, input) {
    await assertParticipant(bookingId, userId, role);
    return repository.create({ bookingId, senderId: userId, body: input.body });
  }

  // Lists a booking's message thread for a participant, masking contact
  // details in every message body unless the booking has reached (or
  // passed through) CONFIRMED.
  async function list(bookingId, userId, role) {
    const booking = await assertParticipant(bookingId, userId, role);
    const messages = await repository.findByBooking(bookingId);
    const unmasked = UNMASKED_STATUSES.includes(booking.status);

    return messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      body: unmasked ? m.body : maskContactDetails(m.body),
      createdAt: m.createdAt,
    }));
  }

  return { send, list };
}
