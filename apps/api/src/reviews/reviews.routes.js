import express from "express";
import { CreateReviewInput } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { requireRole } from "../common/role-middleware.js";
import { validateBody } from "../common/validate.js";
import { createReviewsController } from "./reviews.controller.js";

// URL surface for the reviews module.
export function createReviewsRoutes({ reviewsService, config }) {
  const router = express.Router();
  const controller = createReviewsController({ reviewsService });
  const auth = requireAuth({ secret: config.JWT_SECRET });
  const parentOnly = requireRole("PARENT");

  router.post("/bookings/:bookingId/review", auth, parentOnly, validateBody(CreateReviewInput), controller.create);
  router.get("/tutors/:id/reviews", controller.listForTutor);

  return router;
}
