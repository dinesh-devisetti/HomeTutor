import { badRequest, conflict, forbidden, notFound } from "../common/errors.js";
import { BookingStateMachine } from "./booking-state-machine.js";

// True if the caller is logged in as PARENT and is this specific booking's
// parent (not just any parent).
function isParentOwner(booking, user) {
  return user.role === "PARENT" && booking.parent.userId === user.id;
}

// True if the caller is logged in as TUTOR and is this specific booking's
// tutor (not just any tutor).
function isTutorOwner(booking, user) {
  return user.role === "TUTOR" && booking.tutor.userId === user.id;
}

// True if the caller is an ADMIN — admins act as a support override on
// every booking event (see EVENT_RULES), still gated by the state machine.
function isAdmin(user) {
  return user.role === "ADMIN";
}

// Matrix approved 2026-09-02: who can trigger which BookingStateMachine
// event. ADMIN acts as a support override on every event, but still only
// through this same state machine — never a way to skip states.
const EVENT_RULES = {
  ACCEPT: (b, u) => isTutorOwner(b, u),
  DECLINE: (b, u) => isTutorOwner(b, u),
  // Parent can only back out pre-payment (REQUESTED/ACCEPTED); once
  // CONFIRMED, only the tutor or an admin can cancel — the state machine
  // alone allows CANCEL from CONFIRMED for anyone, so the state check has
  // to live here, per-actor.
  CANCEL: (b, u) => {
    if (isAdmin(u)) return true;
    if (isTutorOwner(b, u)) return ["REQUESTED", "ACCEPTED", "CONFIRMED"].includes(b.status);
    if (isParentOwner(b, u)) return ["REQUESTED", "ACCEPTED"].includes(b.status);
    return false;
  },
  CONFIRM: (b, u) => isParentOwner(b, u) || isAdmin(u),
  START: (b, u) => isTutorOwner(b, u),
  COMPLETE: (b, u) => isTutorOwner(b, u),
  NO_SHOW: (b, u) => isTutorOwner(b, u) || isAdmin(u),
  REFUND: (b, u) => isAdmin(u),
};

// Detects a Postgres EXCLUDE-constraint violation (the bookings_no_overlap
// constraint / error code 23P01) so create() can translate it into a
// friendly 409 instead of a raw DB error leaking through.
function isExclusionViolation(err) {
  return /bookings_no_overlap|23P01/.test(String(err?.message ?? err));
}

export function createBookingsService({ repository }) {
  // Loads a booking by id or throws 404 — the shared first step of every
  // read/transition below.
  async function loadBooking(id) {
    const booking = await repository.findById(id);
    if (!booking) throw notFound("Booking not found");
    return booking;
  }

  // Creates a new booking request: verifies the caller is a parent booking
  // their own student, verifies the tutor actually offers this
  // subject+mode, computes price server-side from the tutor's rate x
  // duration (never trusts a client-supplied price), and inserts in
  // REQUESTED status. Translates a double-booking exclusion-constraint
  // violation into a 409 rather than a raw DB error.
  async function create(userId, input) {
    const parent = await repository.findParentByUserId(userId);
    if (!parent) throw forbidden("Only parents can create bookings");

    const student = await repository.findStudentById(input.studentId);
    if (!student || student.guardianId !== parent.id) throw forbidden("Not your student");

    const tutor = await repository.findTutorById(input.tutorId);
    if (!tutor) throw notFound("Tutor not found");

    const subjectMatch = await repository.findMatchingSubject(input.tutorId, input.subject, input.mode);
    if (!subjectMatch) throw badRequest("Tutor does not offer this subject/mode");

    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);
    const durationHours = (endTime - startTime) / 3_600_000;
    if (durationHours <= 0) throw badRequest("endTime must be after startTime");

    const pricePaise = Math.round(subjectMatch.ratePaisePerHour * durationHours);

    try {
      return await repository.create({
        parentId: parent.id,
        studentId: student.id,
        tutorId: tutor.id,
        subject: input.subject,
        mode: input.mode,
        startTime,
        endTime,
        pricePaise,
      });
    } catch (err) {
      if (isExclusionViolation(err)) {
        throw conflict("Tutor is already booked for an overlapping time slot");
      }
      throw err;
    }
  }

  // Reads one booking, restricted to its own parent, its own tutor, or any
  // admin — nobody else can look up a booking by id.
  async function getById(userId, role, bookingId) {
    const booking = await loadBooking(bookingId);
    const user = { id: userId, role };
    if (!isParentOwner(booking, user) && !isTutorOwner(booking, user) && !isAdmin(user)) {
      throw forbidden("Not your booking");
    }
    return booking;
  }

  // Lists the caller's own bookings — as a parent's requests, or as a
  // tutor's incoming bookings, depending on role. Returns an empty list
  // for any other role (e.g. admin has no personal booking list).
  async function listMine(userId, role) {
    if (role === "PARENT") {
      const parent = await repository.findParentByUserId(userId);
      return parent ? repository.findMineAsParent(parent.id) : [];
    }
    if (role === "TUTOR") {
      const tutor = await repository.findTutorByUserId(userId);
      return tutor ? repository.findMineAsTutor(tutor.id) : [];
    }
    return [];
  }

  // The single engine behind every booking action (accept/decline/cancel/
  // confirm/start/complete/no-show/refund): loads the booking, checks
  // EVENT_RULES for whether this actor may fire this event, asks
  // BookingStateMachine for the resulting status (throws 400 if the
  // transition is invalid from the current status), then writes the new
  // status through the guarded repository update (returns 409 if another
  // request already changed the status first).
  async function transition(userId, role, bookingId, event, extra = {}) {
    const booking = await loadBooking(bookingId);
    const user = { id: userId, role };

    if (!EVENT_RULES[event](booking, user)) {
      throw forbidden("Not allowed to perform this action");
    }

    const nextStatus = BookingStateMachine.next(booking.status, event);

    const updated = await repository.updateStatus(booking.id, booking.status, nextStatus, extra);
    if (!updated) throw conflict("Booking status changed concurrently — retry");

    return updated;
  }

  // Tutor accepts a REQUESTED booking.
  const accept = (userId, role, id) => transition(userId, role, id, "ACCEPT");
  // Tutor declines a REQUESTED booking, with an optional reason.
  const decline = (userId, role, id, reason) =>
    transition(userId, role, id, "DECLINE", reason ? { cancelReason: reason } : {});
  // Cancels a booking (who's allowed depends on current status — see
  // EVENT_RULES.CANCEL), with an optional reason.
  const cancel = (userId, role, id, reason) =>
    transition(userId, role, id, "CANCEL", reason ? { cancelReason: reason } : {});
  // Parent (or admin) confirms an ACCEPTED booking. Payment collection is
  // a future feature — this basic build transitions straight to CONFIRMED.
  const confirm = (userId, role, id) => transition(userId, role, id, "CONFIRM");
  // Tutor marks a CONFIRMED session as started.
  const start = (userId, role, id) => transition(userId, role, id, "START");
  // Tutor marks an IN_PROGRESS session as finished — stamps completedAt.
  const complete = (userId, role, id) => transition(userId, role, id, "COMPLETE", { completedAt: new Date() });
  // Tutor or admin marks a session as a no-show.
  const noShow = (userId, role, id) => transition(userId, role, id, "NO_SHOW");
  // Admin-only: marks a CONFIRMED booking refunded (status-only — no money
  // moves; real payments are a future feature).
  const refund = (userId, role, id) => transition(userId, role, id, "REFUND");

  return { create, getById, listMine, accept, decline, cancel, confirm, start, complete, noShow, refund };
}
