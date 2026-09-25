import express from "express";
import { SendMessageInput } from "@hometutoring/types";
import { requireAuth } from "../common/auth-middleware.js";
import { validateBody } from "../common/validate.js";
import { createMessagingController } from "./messaging.controller.js";

// URL surface for the messaging module.
export function createMessagingRoutes({ messagingService, config }) {
  const router = express.Router();
  const controller = createMessagingController({ messagingService });
  const auth = requireAuth({ secret: config.JWT_SECRET });

  router.post("/bookings/:bookingId/messages", auth, validateBody(SendMessageInput), controller.send);
  router.get("/bookings/:bookingId/messages", auth, controller.list);

  return router;
}
