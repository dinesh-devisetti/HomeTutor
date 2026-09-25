import express from "express";
import { AdminUsersQuery, AdminBookingsQuery } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { requireRole } from "../common/role-middleware.js";
import { validateQuery } from "../common/validate.js";
import { createAdminController } from "./admin.controller.js";

// URL surface for the admin module — admin-only throughout.
export function createAdminRoutes({ adminService, config }) {
  const router = express.Router();
  const controller = createAdminController({ adminService });
  const auth = requireAuth({ secret: config.JWT_SECRET });
  const adminOnly = requireRole("ADMIN");

  router.get("/admin/users", auth, adminOnly, validateQuery(AdminUsersQuery), controller.listUsers);
  router.get("/admin/bookings", auth, adminOnly, validateQuery(AdminBookingsQuery), controller.listBookings);
  router.get("/admin/reviews", auth, adminOnly, controller.listReviews);
  router.delete("/admin/reviews/:id", auth, adminOnly, controller.deleteReview);

  return router;
}
