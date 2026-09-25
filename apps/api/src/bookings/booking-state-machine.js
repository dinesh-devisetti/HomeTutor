import { AppError } from "../common/errors.js";

// Pure, framework-agnostic transition table — no DB access, no HTTP
// concerns. Every booking status write in the codebase must route through
// BookingsRepository.updateStatus(id, fromStatus, toStatus), which this
// module's output feeds; no other code path writes booking.status.
const TRANSITIONS = {
  REQUESTED: { ACCEPT: "ACCEPTED", DECLINE: "DECLINED", CANCEL: "CANCELLED" },
  ACCEPTED: { CONFIRM: "CONFIRMED", CANCEL: "CANCELLED" },
  CONFIRMED: { START: "IN_PROGRESS", CANCEL: "CANCELLED", NO_SHOW: "NO_SHOW", REFUND: "REFUNDED" },
  IN_PROGRESS: { COMPLETE: "COMPLETED", NO_SHOW: "NO_SHOW" },
  COMPLETED: {},
  DECLINED: {},
  CANCELLED: {},
  NO_SHOW: {},
  REFUNDED: {},
};

export class BookingStateMachine {
  // Looks up the resulting status for (currentStatus, event) and returns
  // it, or throws a 400 AppError if that event isn't valid from that
  // status — the single source of truth bookings.service.js's transition()
  // consults before ever writing a new status.
  static next(currentStatus, event) {
    const target = TRANSITIONS[currentStatus]?.[event];
    if (!target) {
      throw new AppError(400, `Cannot ${event} a booking in status ${currentStatus}`);
    }
    return target;
  }

  // Lists which events are valid from a given status — used by the web
  // app (build step 14) to only render action buttons that would actually
  // succeed, and by tests to assert terminal statuses allow nothing.
  static allowedEvents(currentStatus) {
    return Object.keys(TRANSITIONS[currentStatus] ?? {});
  }
}
