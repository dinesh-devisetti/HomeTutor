import express from "express";
import { CreateBookingInput, BookingReasonInput } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { requireRole } from "../common/role-middleware.js";
import { validateBody } from "../common/validate.js";
import { createBookingsController } from "./bookings.controller.js";

// URL surface for the bookings module — every path and every guard (auth/
// role/validation) that applies to it lives here; what each route actually
// does lives in bookings.controller.js. Fine-grained per-instance ownership
// (not just role) is enforced inside the service's EVENT_RULES — role
// middleware alone can't gate the action routes below, since e.g. "any
// TUTOR" isn't enough, it must be *this booking's* tutor.
export function createBookingsRoutes({ bookingsService, config }) {
  const router = express.Router();
  const controller = createBookingsController({ bookingsService });
  const auth = requireAuth({ secret: config.JWT_SECRET });
  const parentOnly = requireRole("PARENT");
  const adminOnly = requireRole("ADMIN");

  router.post("/bookings", auth, parentOnly, validateBody(CreateBookingInput), controller.create);
  router.get("/bookings/mine", auth, controller.listMine);
  router.get("/bookings/:id", auth, controller.getById);
  router.post("/bookings/:id/accept", auth, controller.accept);
  router.post("/bookings/:id/decline", auth, validateBody(BookingReasonInput), controller.decline);
  router.post("/bookings/:id/confirm", auth, controller.confirm);
  router.post("/bookings/:id/start", auth, controller.start);
  router.post("/bookings/:id/cancel", auth, validateBody(BookingReasonInput), controller.cancel);
  router.post("/bookings/:id/complete", auth, controller.complete);
  router.post("/bookings/:id/no-show", auth, controller.noShow);
  router.post("/bookings/:id/refund", auth, adminOnly, controller.refund);

  return router;
}
